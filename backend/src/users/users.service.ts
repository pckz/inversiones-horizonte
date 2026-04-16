import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, UserRole } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async create(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    phone?: string;
    taxId?: string;
    role?: UserRole;
    isActive?: boolean;
    isVerified?: boolean;
  }) {
    try {
      return await this.prisma.user.create({ data });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw e;
    }
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByIdWithDetails(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        taxId: true,
        isActive: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
        investments: {
          orderBy: { createdAt: 'desc' },
          include: {
            project: {
              select: { title: true, slug: true, coverImageUrl: true, status: true },
            },
            payments: { orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });
  }

  findAll(params?: { skip?: number; take?: number; role?: string }) {
    return this.prisma.user.findMany({
      where: params?.role ? { role: params.role as any } : undefined,
      skip: params?.skip,
      take: params?.take ?? 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        taxId: true,
        isActive: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }

  async countAll() {
    return this.prisma.user.count();
  }

  updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    const normalizedData = { ...data };

    if (data.isVerified === true) {
      normalizedData.verificationReminderSentAt = new Date();
    }

    if (data.isVerified === false) {
      normalizedData.verificationReminderSentAt = null;
    }

    return this.prisma.user.update({ where: { id }, data: normalizedData });
  }

  toggleActive(id: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }

  async sendVerificationReminder(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        isVerified: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new ConflictException('User is inactive');
    }

    if (user.isVerified) {
      throw new ConflictException('User is already verified');
    }

    await this.mail.sendVerificationReminder(user.email, user.fullName);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationReminderSentAt: new Date() },
    });

    return { success: true };
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendScheduledVerificationReminders() {
    const threshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
        isVerified: false,
        verificationReminderSentAt: null,
        createdAt: { lte: threshold },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    if (users.length === 0) {
      return;
    }

    for (const user of users) {
      try {
        await this.mail.sendVerificationReminder(user.email, user.fullName);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { verificationReminderSentAt: new Date() },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to send verification reminder to ${user.email}: ${message}`);
      }
    }
  }
}
