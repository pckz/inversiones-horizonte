import { IsUUID, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateInvestmentDto {
  @IsUUID()
  projectId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsNumber()
  expectedReturnPct?: number;

  @IsOptional()
  @IsNumber()
  expectedProfitAmount?: number;

  @IsOptional()
  @IsNumber()
  expectedTotalAmount?: number;
}
