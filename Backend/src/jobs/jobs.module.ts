import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsProcessor } from './notifications.processor';
import { DeliveriesProcessor } from './deliveries.processor';
import { TwilioModule } from '../twilio/twilio.module';
import { TookanModule } from '../tookan/tookan.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [
        TwilioModule, TookanModule, PrismaModule,
        BullModule.registerQueue({ name: 'notifications' }),
    ],
    providers: [NotificationsProcessor, DeliveriesProcessor],
})
export class JobsModule { }
