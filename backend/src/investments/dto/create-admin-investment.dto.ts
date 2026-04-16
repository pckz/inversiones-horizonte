import { IsUUID } from 'class-validator';
import { CreateInvestmentDto } from './create-investment.dto';

export class CreateAdminInvestmentDto extends CreateInvestmentDto {
  @IsUUID()
  userId: string;
}
