import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ReviewPaymentDto } from './dto/review-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('admin' as any, 'readonly_admin' as any)
  findAllAdmin() {
    return this.payments.findAllAdmin();
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles('admin' as any, 'readonly_admin' as any)
  findPending() {
    return this.payments.findAllPending();
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin' as any, 'readonly_admin' as any)
  getStats() {
    return this.payments.getStats();
  }

  @Get('investment/:investmentId')
  findByInvestment(@Param('investmentId', ParseUUIDPipe) investmentId: string) {
    return this.payments.findByInvestment(investmentId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('investor' as any)
  create(@Body() dto: CreatePaymentDto) {
    return this.payments.create(dto);
  }

  @Post('admin')
  @UseGuards(RolesGuard)
  @Roles('admin' as any)
  createAdmin(
    @Body() dto: CreatePaymentDto,
    @CurrentUser('sub') reviewerId: string,
  ) {
    return this.payments.createAdmin(dto, reviewerId);
  }

  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles('admin' as any)
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewPaymentDto,
    @CurrentUser('sub') reviewerId: string,
  ) {
    return this.payments.review(id, dto.status, reviewerId, dto.reviewNotes);
  }
}
