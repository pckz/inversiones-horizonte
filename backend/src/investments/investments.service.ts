import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { InvestmentStatus } from '@prisma/client';
import { CreateInvestmentDto } from './dto/create-investment.dto';

const CONFIRMED_INVESTMENT_STATUSES: InvestmentStatus[] = ['signed', 'active', 'completed'];
const PENDING_INVESTMENT_STATUSES: InvestmentStatus[] = ['pending', 'transfer_pending', 'transfer_review'];

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

  async create(dto: CreateInvestmentDto, userId: string) {
    const investment = await this.prisma.investment.create({
      data: {
        projectId: dto.projectId,
        userId,
        amount: dto.amount,
        status: 'transfer_pending',
        expectedReturnPct: dto.expectedReturnPct,
        expectedProfitAmount: dto.expectedProfitAmount,
        expectedTotalAmount: dto.expectedTotalAmount,
      },
      include: {
        user: { select: { fullName: true, email: true } },
        project: { select: { title: true } },
      },
    });

    this.mail
      .sendInvestmentCreated(
        investment.user.email,
        investment.user.fullName,
        investment.project.title,
        Number(dto.amount),
      )
      .catch(() => {});

    const admins = await this.prisma.user.findMany({
      where: { role: 'admin' },
      select: { email: true },
    });
    for (const admin of admins) {
      this.mail
        .sendNewInvestmentAdmin(
          admin.email,
          investment.user.fullName,
          investment.user.email,
          investment.project.title,
          Number(dto.amount),
        )
        .catch(() => {});
    }

    return investment;
  }

  findAllAdmin() {
    return this.prisma.investment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true } },
        project: { select: { title: true, slug: true } },
        payments: {
          select: {
            id: true,
            status: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { payments: true } },
      },
    });
  }

  findByUser(userId: string) {
    return this.prisma.investment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImageUrl: true,
            status: true,
            category: true,
            location: true,
            description: true,
            estimatedReturnPct: true,
            estimatedDurationMonths: true,
            startDate: true,
            projectedEndDate: true,
            targetAmount: true,
            raisedAmount: true,
          },
        },
        payments: { orderBy: { createdAt: 'desc' } },
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

  async cancelPending(id: string) {
    const investment = await this.prisma.investment.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
      },
    });

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    if (!PENDING_INVESTMENT_STATUSES.includes(investment.status)) {
      throw new BadRequestException('Only pending investments can be deleted');
    }

    await this.prisma.investment.delete({
      where: { id },
    });

    return { success: true };
  }

  async getStats() {
    const [total, pending, active, totalAmount] = await Promise.all([
      this.prisma.investment.count(),
      this.prisma.investment.count({ where: { status: { in: PENDING_INVESTMENT_STATUSES } } }),
      this.prisma.investment.count({ where: { status: 'active' } }),
      this.prisma.investment.aggregate({
        where: { status: { in: CONFIRMED_INVESTMENT_STATUSES } },
        _sum: { amount: true },
      }),
    ]);
    return { total, pending, active, totalAmount: totalAmount._sum.amount ?? 0 };
  }
}
