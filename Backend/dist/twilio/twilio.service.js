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
exports.TwilioService = void 0;
const common_1 = require("@nestjs/common");
const twilio_1 = require("twilio");
let TwilioService = class TwilioService {
    client;
    fromNumber;
    constructor() {
        this.client = new twilio_1.Twilio(process.env.TWILIO_ACCOUNT_SID || 'AC_placeholder', process.env.TWILIO_AUTH_TOKEN || 'auth_placeholder');
        this.fromNumber = process.env.TWILIO_FROM_NUMBER || '+1234567890';
    }
    normalizePhone(phone) {
        if (!phone)
            return phone;
        let cleaned = phone.replace(/\s+/g, '').replace(/[^+\d]/g, '');
        if (cleaned.startsWith('07') && cleaned.length === 11) {
            cleaned = '+44' + cleaned.substring(1);
        }
        if (cleaned.startsWith('44') && !cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }
        return cleaned;
    }
    async sendSms(to, body) {
        const normalizedTo = this.normalizePhone(to);
        try {
            const message = await this.client.messages.create({
                body,
                from: this.fromNumber,
                to: normalizedTo,
            });
            return message;
        }
        catch (error) {
            console.error('Failed to send SMS via Twilio', error);
            throw error;
        }
    }
};
exports.TwilioService = TwilioService;
exports.TwilioService = TwilioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TwilioService);
//# sourceMappingURL=twilio.service.js.map