import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TwilioService } from '../twilio/twilio.service';
export declare class NotificationsProcessor extends WorkerHost {
    private readonly twilioService;
    constructor(twilioService: TwilioService);
    process(job: Job<any, any, string>): Promise<any>;
}
