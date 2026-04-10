import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { InvestmentStatus } from '@prisma/client';
import { CreateInvestmentDto } from './dto/create-investment.dto';

const VALID_TRANSITIONS: Record<InvestmentStatus, InvestmentStatus[]> = {
  pending: ['transfer_pending', 'cancelled'],
  transfer_pending: ['transfer_review', 'cancelled'],
  transfer_review: ['signed', 'transfer_pending', 'cancelled'],
  signed: ['active', 'cancelled'],
  active: ['completed'],
  completed: [],
  cancelled: [],
};

@Injectable()
export class InvestmentsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  create(dto: CreateInvestmentDto, userId: string) {
    return this.prisma.investment.create({
      data: {
        projectId: dto.projectId,
        userId,
        amount: dto.amount,
        expectedReturnPct: dto.expectedReturnPct,
        expectedProfitAmount: dto.expectedProfitAmount,
        expectedTotalAmount: dto.expectedTotalAmount,
      },
    });
  }

  findAllAdmin() {
    return this.prisma.investment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true } },
        project: { select: { title: true, slug: true } },
        _count: { select: { payments: true } },
      },
    });
  }

  findByUser(userId: string) {
    return this.prisma.investment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { title: true, slug: true, coverImageUrl: true } },
        payments: true,
      },
    });
  }

  async findById(id: string) {
    const inv = await this.prisma.investment.findUnique({
      where: { id },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        project: { select: { title: true, slug: true } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!inv) throw new NotFoundException('Investment not found');
    return inv;
  }

  async updateStatus(id: string, newStatus: InvestmentStatus, adminNotes?: string) {
    const inv = await this.prisma.investment.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Investment not found');

    const allowed = VALID_TRANSITIONS[inv.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${inv.status} to ${newStatus}`,
      );
    }

    const data: any = { status: newStatus };
    if (adminNotes) data.adminNotes = adminNotes;
    if (newStatus === 'active') data.approvedAt = new Date();
    if (newStatus === 'completed') data.completedAt = new Date();

    const updated = await this.prisma.investment.update({
      where: { id },
      data,
      include: {
        user: { select: { email: true, fullName: true } },
        project: { select: { title: true } },
      },
    });

    this.mail
      .sendInvestmentStatusUpdate(
        updated.user.email,
        updated.user.fullName,
        updated.project.title,
        newStatus,
      )
      .catch(() => {});

    return updated;
  }

  async getStats() {
    const [total, pending, active, totalAmount] = await Promise.all([
      this.prisma.investment.count(),
      this.prisma.investment.count({ where: { status: { in: ['pending', 'transfer_pending', 'transfer_review'] } } }),
      this.prisma.investment.count({ where: { status: 'active' } }),
      this.prisma.investment.aggregate({ _sum: { amount: true } }),
    ]);
    return { total, pending, active, totalAmount: totalAmount._sum.amount ?? 0 };
  }
}
