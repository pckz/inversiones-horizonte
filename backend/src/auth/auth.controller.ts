import {
  Controller,
  Post,
  Patch,
  Body,
  Get,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private users: UsersService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser('sub') userId: string) {
    const user = await this.users.findById(userId);
    if (!user) return null;
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() body: { fullName?: string; phone?: string },
  ) {
    const data: any = {};
    if (body.fullName !== undefined) data.fullName = body.fullName;
    if (body.phone !== undefined) data.phone = body.phone;
    const updated = await this.users.update(userId, data);
    const { passwordHash: _, ...safe } = updated;
    return safe;
  }

  @Post('me/change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const user = await this.users.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const hash = await bcrypt.hash(body.newPassword, 12);
    await this.users.update(userId, { passwordHash: hash });
    return { message: 'Password updated' };
  }
}
