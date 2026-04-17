import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TwilioService } from '../twilio/twilio.service';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
    constructor(private readonly twilioService: TwilioService) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        if (job.name === 'sms') {
            const { phone, message } = job.data;
            try {
                await this.twilioService.sendSms(phone, message);
                console.log(`[Job] Successfully sent SMS to ${phone}`);
            } catch (error) {
                console.error(`[Job] Failed to send SMS to ${phone}: ${error.message}`);
                throw error; // Let BullMQ retry
            }
        }
    }
}
