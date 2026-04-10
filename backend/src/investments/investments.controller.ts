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
import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentStatusDto } from './dto/update-investment-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('investments')
@UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(private investments: InvestmentsService) {}

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('admin' as any)
  findAllAdmin() {
    return this.investments.findAllAdmin();
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin' as any)
  getStats() {
    return this.investments.getStats();
  }

  @Get('my')
  findMine(@CurrentUser('sub') userId: string) {
    return this.investments.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.investments.findById(id);
  }

  @Post()
  create(@Body() dto: CreateInvestmentDto, @CurrentUser('sub') userId: string) {
    return this.investments.create(dto, userId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin' as any)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvestmentStatusDto,
  ) {
    return this.investments.updateStatus(id, dto.status, dto.adminNotes);
  }
}
