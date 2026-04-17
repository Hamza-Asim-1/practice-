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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const twilio_service_1 = require("../twilio/twilio.service");
let NotificationsProcessor = class NotificationsProcessor extends bullmq_1.WorkerHost {
    twilioService;
    constructor(twilioService) {
        super();
        this.twilioService = twilioService;
    }
    async process(job) {
        if (job.name === 'sms') {
            const { phone, message } = job.data;
            try {
                await this.twilioService.sendSms(phone, message);
                console.log(`[Job] Successfully sent SMS to ${phone}`);
            }
            catch (error) {
                console.error(`[Job] Failed to send SMS to ${phone}: ${error.message}`);
                throw error;
            }
        }
    }
};
exports.NotificationsProcessor = NotificationsProcessor;
exports.NotificationsProcessor = NotificationsProcessor = __decorate([
    (0, bullmq_1.Processor)('notifications'),
    __metadata("design:paramtypes", [twilio_service_1.TwilioService])
], NotificationsProcessor);
//# sourceMappingURL=notifications.processor.js.map