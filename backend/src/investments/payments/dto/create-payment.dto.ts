import { IsUUID, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  investmentId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  transferReference?: string;

  @IsOptional()
  @IsString()
  receiptFileUrl?: string;

  @IsOptional()
  @IsDateString()
  transferredAt?: string;
}
