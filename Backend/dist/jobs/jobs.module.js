"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const notifications_processor_1 = require("./notifications.processor");
const deliveries_processor_1 = require("./deliveries.processor");
const twilio_module_1 = require("../twilio/twilio.module");
const tookan_module_1 = require("../tookan/tookan.module");
const prisma_module_1 = require("../prisma/prisma.module");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            twilio_module_1.TwilioModule, tookan_module_1.TookanModule, prisma_module_1.PrismaModule,
            bullmq_1.BullModule.registerQueue({ name: 'notifications' }),
        ],
        providers: [notifications_processor_1.NotificationsProcessor, deliveries_processor_1.DeliveriesProcessor],
    })
], JobsModule);
//# sourceMappingURL=jobs.module.js.map