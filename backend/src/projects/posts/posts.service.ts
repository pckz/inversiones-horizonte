import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import slugify from 'slugify';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async create(dto: CreatePostDto) {
    const slug = slugify(dto.title, { lower: true, strict: true });
    return this.prisma.projectPost.create({
      data: {
        projectId: dto.projectId,
        title: dto.title,
        slug,
        body: dto.body,
        coverImage: dto.coverImage,
        isPublished: dto.isPublished ?? false,
        publishedAt: dto.isPublished ? new Date() : undefined,
      },
    });
  }

  findByProject(projectId: string, onlyPublished = false) {
    return this.prisma.projectPost.findMany({
      where: {
        projectId,
        ...(onlyPublished ? { isPublished: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const post = await this.prisma.projectPost.findUnique({
      where: { id },
      include: { project: { select: { title: true, slug: true } } },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(id: string, dto: UpdatePostDto) {
    const existing = await this.prisma.projectPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Post not found');

    const data: any = { ...dto };
    if (dto.title) {
      data.slug = slugify(dto.title, { lower: true, strict: true });
    }
    if (dto.isPublished && !existing.isPublished) {
      data.publishedAt = new Date();
    }
    return this.prisma.projectPost.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.projectPost.delete({ where: { id } });
  }

  async publishAndEmail(id: string) {
    const post = await this.prisma.projectPost.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!post) throw new NotFoundException('Post not found');

    await this.prisma.projectPost.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date(), sentByEmail: true },
    });

    const investors = await this.prisma.investment.findMany({
      where: { projectId: post.projectId, status: { in: ['active', 'signed', 'completed'] } },
      select: { user: { select: { email: true } } },
      distinct: ['userId'],
    });

    const emails = investors.map((i) => i.user.email);
    if (emails.length > 0) {
      await this.mail.sendProjectAnnouncement(
        emails,
        post.project.title,
        post.title,
        post.body,
      );
    }

    return { sent: emails.length };
  }
}
