import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import slugify from 'slugify';

function computeProjectFields(project: any) {
  if (!project) return project;

  const returnPct = project.estimatedReturnPct
    ? Number(project.estimatedReturnPct)
    : null;
  const months = project.estimatedDurationMonths ?? null;

  let annualizedReturnPct: number | null = null;
  if (returnPct !== null && months && months > 0) {
    annualizedReturnPct = parseFloat(((returnPct / months) * 12).toFixed(2));
  }

  let progressPct = 0;
  if (project.startDate && project.projectedEndDate) {
    const start = new Date(project.startDate).getTime();
    const end = new Date(project.projectedEndDate).getTime();
    const now = Date.now();
    if (end > start) {
      progressPct = Math.min(100, Math.max(0, parseFloat((((now - start) / (end - start)) * 100).toFixed(1))));
    }
  }
  if (project.status === 'terminado') progressPct = 100;

  return { ...project, annualizedReturnPct, progressPct };
}

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    const slug = slugify(dto.title, { lower: true, strict: true });
    return this.prisma.project.create({
      data: {
        ...dto,
        slug,
        projectedEndDate: dto.projectedEndDate ? new Date(dto.projectedEndDate) : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        createdById: userId,
      },
    });
  }

  async findAllPublic() {
    const projects = await this.prisma.project.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
    });
    return projects.map(computeProjectFields);
  }

  async findAllAdmin() {
    const projects = await this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { fullName: true } },
        _count: { select: { investments: true, posts: true } },
      },
    });
    return projects.map(computeProjectFields);
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        updates: { where: { isPublic: true }, orderBy: { createdAt: 'desc' } },
        documents: { where: { visibility: 'public' }, orderBy: { sortOrder: 'asc' } },
        posts: { where: { isPublished: true }, orderBy: { publishedAt: 'desc' } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return computeProjectFields(project);
  }

  async findById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        updates: { orderBy: { createdAt: 'desc' } },
        documents: { orderBy: { sortOrder: 'asc' } },
        posts: { orderBy: { createdAt: 'desc' } },
        createdBy: { select: { fullName: true } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return computeProjectFields(project);
  }

  async update(id: string, dto: UpdateProjectDto) {
    const data: any = { ...dto };
    if (dto.title) {
      data.slug = slugify(dto.title, { lower: true, strict: true });
    }
    if (dto.projectedEndDate) {
      data.projectedEndDate = new Date(dto.projectedEndDate);
    }
    if (dto.startDate) {
      data.startDate = new Date(dto.startDate);
    }
    return this.prisma.project.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }

  countAll() {
    return this.prisma.project.count();
  }

  async getStats() {
    const [total, active, totalRaised] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.project.count({ where: { status: { in: ['por_financiarse', 'en_ejecucion'] } } }),
      this.prisma.project.aggregate({ _sum: { raisedAmount: true } }),
    ]);
    return { total, active, totalRaised: totalRaised._sum.raisedAmount ?? 0 };
  }
}
