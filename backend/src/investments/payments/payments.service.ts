import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { PaymentStatus } from '@prisma/client';
import { CreatePaymentDto } from './dto/create-payment.dto';

const CONFIRMED_INVESTMENT_STATUSES = ['signed', 'active', 'completed'] as const;

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async create(dto: CreatePaymentDto) {
    const payment = await this.prisma.investmentPayment.create({
      data: {
        investmentId: dto.investmentId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        transferReference: dto.transferReference,
        receiptFileUrl: dto.receiptFileUrl,
        transferredAt: dto.transferredAt ? new Date(dto.transferredAt) : undefined,
      },
    });

    await this.prisma.investment.update({
      where: { id: dto.investmentId },
      data: {
        status: 'transfer_review',
      },
    });
    return payment;
  }

  async createAdmin(dto: CreatePaymentDto, reviewedById: string) {
    const investment = await this.prisma.investment.findUnique({
      where: { id: dto.investmentId },
      include: {
        payments: {
          select: { status: true },
        },
      },
    });

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    if (investment.payments.some((payment) => payment.status === 'approved')) {
      throw new BadRequestException('Investment payment is already confirmed');
    }

    const payment = await this.prisma.investmentPayment.create({
      data: {
        investmentId: dto.investmentId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        transferReference: dto.transferReference,
        receiptFileUrl: dto.receiptFileUrl,
        transferredAt: dto.transferredAt ? new Date(dto.transferredAt) : new Date(),
        status: 'approved',
        reviewedById,
        reviewedAt: new Date(),
      },
      include: {
        investment: {
          include: {
            user: { select: { email: true, fullName: true } },
            project: { select: { title: true } },
          },
        },
      },
    });

    await this.syncInvestmentStatusFromPayments(dto.investmentId);
    await this.syncProjectRaisedAmount(payment.investment.projectId);

    this.mail
      .sendPaymentReviewed(
        payment.investment.user.email,
        payment.investment.user.fullName,
        payment.investment.project.title,
        true,
      )
      .catch(() => {});

    return payment;
  }

  async confirmInvestmentByAdmin(investmentId: string, reviewedById: string) {
    const investment = await this.prisma.investment.findUnique({
      where: { id: investmentId },
      include: {
        payments: {
          select: { id: true, status: true },
        },
      },
    });

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    if (investment.status === 'cancelled' || investment.status === 'completed') {
      throw new BadRequestException('Investment cannot be confirmed');
    }

    if (investment.payments.some((payment) => payment.status === 'approved')) {
      throw new BadRequestException('Investment payment is already confirmed');
    }

    return this.createAdmin(
      {
        investmentId,
        amount: Number(investment.amount),
        paymentMethod: 'bank_transfer',
      },
      reviewedById,
    );
  }

  findByInvestment(investmentId: string) {
    return this.prisma.investmentPayment.findMany({
      where: { investmentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllPending() {
    return this.prisma.investmentPayment.findMany({
      where: { status: 'pending_review' },
      orderBy: { createdAt: 'asc' },
      include: {
        investment: {
          include: {
            user: { select: { fullName: true, email: true } },
            project: { select: { title: true } },
          },
        },
      },
    });
  }

  findAllAdmin() {
    return this.prisma.investmentPayment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        investment: {
          include: {
            user: { select: { fullName: true, email: true } },
            project: { select: { title: true } },
          },
        },
        reviewedBy: { select: { fullName: true } },
      },
    });
  }

  async review(id: string, status: PaymentStatus, reviewedById: string, reviewNotes?: string) {
    const payment = await this.prisma.investmentPayment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');

    const updated = await this.prisma.investmentPayment.update({
      where: { id },
      data: {
        status,
        reviewedById,
        reviewedAt: new Date(),
        reviewNotes,
      },
      include: {
        investment: {
          include: {
            user: { select: { email: true, fullName: true } },
            project: { select: { title: true } },
          },
        },
      },
    });

    this.mail
      .sendPaymentReviewed(
        updated.investment.user.email,
        updated.investment.user.fullName,
        updated.investment.project.title,
        status === 'approved',
        reviewNotes,
      )
      .catch(() => {});

    await this.syncInvestmentStatusFromPayments(updated.investmentId);
    await this.syncProjectRaisedAmount(updated.investment.projectId);

    return updated;
  }

  async getStats() {
    const [total, pending, approved] = await Promise.all([
      this.prisma.investmentPayment.count(),
      this.prisma.investmentPayment.count({ where: { status: 'pending_review' } }),
      this.prisma.investmentPayment.count({ where: { status: 'approved' } }),
    ]);
    return { total, pending, approved };
  }

  private async syncInvestmentStatusFromPayments(investmentId: string) {
    const investment = await this.prisma.investment.findUnique({
      where: { id: investmentId },
      include: {
        payments: {
          select: { status: true },
        },
      },
    });

    if (!investment || investment.status === 'cancelled' || investment.status === 'completed') {
      return;
    }

    const hasApprovedPayment = investment.payments.some((payment) => payment.status === 'approved');
    const nextStatus = hasApprovedPayment ? 'active' : 'transfer_pending';

    await this.prisma.investment.update({
      where: { id: investmentId },
      data: {
        status: nextStatus,
        approvedAt: hasApprovedPayment ? investment.approvedAt ?? new Date() : null,
      },
    });
  }

  private async syncProjectRaisedAmount(projectId: string) {
    const confirmed = await this.prisma.investment.findMany({
      where: {
        projectId,
        status: { in: [...CONFIRMED_INVESTMENT_STATUSES] },
      },
      select: {
        amount: true,
      },
    });

    const raisedAmount = confirmed.reduce((sum, investment) => sum + Number(investment.amount), 0);

    await this.prisma.project.update({
      where: { id: projectId },
      data: { raisedAmount },
    });
  }
}
