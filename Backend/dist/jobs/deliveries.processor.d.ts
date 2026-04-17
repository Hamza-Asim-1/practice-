import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TookanService } from '../tookan/tookan.service';
import { PrismaService } from '../prisma/prisma.service';
import { Queue } from 'bullmq';
export declare class DeliveriesProcessor extends WorkerHost {
    private readonly tookanService;
    private readonly prisma;
    private readonly notificationsQueue;
    constructor(tookanService: TookanService, prisma: PrismaService, notificationsQueue: Queue);
    process(job: Job<any, any, string>): Promise<any>;
}
