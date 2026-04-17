"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveriesProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const tookan_service_1 = require("../tookan/tookan.service");
const prisma_service_1 = require("../prisma/prisma.service");
const bullmq_2 = require("@nestjs/bullmq");
const bullmq_3 = require("bullmq");
let DeliveriesProcessor = class DeliveriesProcessor extends bullmq_1.WorkerHost {
    tookanService;
    prisma;
    notificationsQueue;
    constructor(tookanService, prisma, notificationsQueue) {
        super();
        this.tookanService = tookanService;
        this.prisma = prisma;
        this.notificationsQueue = notificationsQueue;
    }
    async process(job) {
        if (job.name === 'create-task') {
            const { taskData, internalDbId, customerPhone } = job.data;
            try {
                const task = await this.tookanService.createDeliveryTask(taskData);
                if (task && task.job_id && internalDbId) {
                    await this.prisma.order.update({
                        where: { id: internalDbId },
                        data: { tookanTaskId: String(task.job_id), trackingUrl: task.tracking_link }
                    });
                    if (customerPhone) {
                        await this.notificationsQueue.add('sms', {
                            phone: customerPhone,
                            message: `Your TEZA order is on the way! Track live: ${task.tracking_link}`
                        });
                    }
                    console.log(`[Job] Successfully created Tookan task for Order ${internalDbId}`);
                }
            }
            catch (error) {
                console.error(`[Job] Failed to create Tookan task for Order ${internalDbId}: ${error.message}`);
                throw error;
            }
        }
    }
};
exports.DeliveriesProcessor = DeliveriesProcessor;
exports.DeliveriesProcessor = DeliveriesProcessor = __decorate([
    (0, bullmq_1.Processor)('deliveries'),
    __param(2, (0, bullmq_2.InjectQueue)('notifications')),
    __metadata("design:paramtypes", [tookan_service_1.TookanService,
        prisma_service_1.PrismaService,
        bullmq_3.Queue])
], DeliveriesProcessor);
//# sourceMappingURL=deliveries.processor.js.map