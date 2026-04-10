import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InvestmentStatus } from '@prisma/client';

export class UpdateInvestmentStatusDto {
  @IsEnum(InvestmentStatus)
  status: InvestmentStatus;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}
