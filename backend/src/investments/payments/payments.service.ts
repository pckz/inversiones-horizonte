import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { PaymentStatus } from '@prisma/client';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  create(dto: CreatePaymentDto) {
    return this.prisma.investmentPayment.create({
      data: {
        investmentId: dto.investmentId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        transferReference: dto.transferReference,
        receiptFileUrl: dto.receiptFileUrl,
        transferredAt: dto.transferredAt ? new Date(dto.transferredAt) : undefined,
      },
    });
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
}
