import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { StripeModule } from '../stripe/stripe.module';
import { TwilioModule } from '../twilio/twilio.module';
import { TookanModule } from '../tookan/tookan.module';
import { UsersModule } from '../users/users.module';

import { forwardRef } from '@nestjs/common';
import { PostcodesModule } from '../postcodes/postcodes.module';
import { PostcodesService } from '../postcodes/postcodes.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'notifications' }),
    BullModule.registerQueue({ name: 'deliveries' }),
    forwardRef(() => StripeModule), TwilioModule, TookanModule, UsersModule,
    PostcodesModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule { }
