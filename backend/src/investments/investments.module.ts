import { Module } from '@nestjs/common';
import { InvestmentsController } from './investments.controller';
import { InvestmentsService } from './investments.service';
import { PaymentsController } from './payments/payments.controller';
import { PaymentsService } from './payments/payments.service';

@Module({
  controllers: [InvestmentsController, PaymentsController],
  providers: [InvestmentsService, PaymentsService],
  exports: [InvestmentsService],
})
export class InvestmentsModule {}
