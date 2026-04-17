import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TookanService } from '../tookan/tookan.service';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Processor('deliveries')
export class DeliveriesProcessor extends WorkerHost {
    constructor(
        private readonly tookanService: TookanService,
        private readonly prisma: PrismaService,
        @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        if (job.name === 'create-task') {
            const { taskData, internalDbId, customerPhone } = job.data;
            
            try {
                const task = await this.tookanService.createDeliveryTask(taskData);
                
                if (task && task.job_id && internalDbId) {
                    // Update internal DB with task ID
                    await this.prisma.order.update({
                        where: { id: internalDbId },
                        data: { tookanTaskId: String(task.job_id), trackingUrl: task.tracking_link }
                    });

                    // Route SMS through the notifications queue for retry support
                    if (customerPhone) {
                        await this.notificationsQueue.add('sms', {
                            phone: customerPhone,
                            message: `Your TEZA order is on the way! Track live: ${task.tracking_link}`
                        });
                    }
                    console.log(`[Job] Successfully created Tookan task for Order ${internalDbId}`);
                }
            } catch (error) {
                console.error(`[Job] Failed to create Tookan task for Order ${internalDbId}: ${error.message}`);
                throw error;
            }
        }
    }
}
