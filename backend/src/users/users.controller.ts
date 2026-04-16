import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private users: UsersService,
    private mail: MailService,
  ) {}

  private toSafeUser<T extends { passwordHash?: string }>(user: T) {
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  @Get()
  @Roles('admin' as any, 'readonly_admin' as any)
  findAll(@Query('skip') skip?: string, @Query('take') take?: string, @Query('role') role?: string) {
    return this.users.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      role,
    });
  }

  @Get('count')
  @Roles('admin' as any, 'readonly_admin' as any)
  count() {
    return this.users.countAll();
  }

  @Post()
  @Roles('admin' as any)
  async create(@Body() dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.users.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      phone: dto.phone,
      taxId: dto.taxId,
      role: dto.role,
      isActive: dto.isActive,
      isVerified: dto.isVerified,
    });
    this.mail.sendWelcome(user.email, user.fullName).catch(() => {});
    return this.toSafeUser(user);
  }

  @Get(':id')
  @Roles('admin' as any, 'readonly_admin' as any)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.findByIdWithDetails(id);
  }

  @Patch(':id')
  @Roles('admin' as any)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto).then((user) => this.toSafeUser(user));
  }

  @Patch(':id/toggle-active')
  @Roles('admin' as any)
  toggleActive(@Param('id', ParseUUIDPipe) id: string, @Body('isActive') isActive: boolean) {
    return this.users.toggleActive(id, isActive).then((user) => this.toSafeUser(user));
  }

  @Post(':id/send-verification-reminder')
  @Roles('admin' as any)
  sendVerificationReminder(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.sendVerificationReminder(id);
  }
}
