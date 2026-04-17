import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
    private client: Twilio;
    private fromNumber: string;

    constructor() {
        this.client = new Twilio(
            process.env.TWILIO_ACCOUNT_SID || 'AC_placeholder',
            process.env.TWILIO_AUTH_TOKEN || 'auth_placeholder'
        );
        this.fromNumber = process.env.TWILIO_FROM_NUMBER || '+1234567890';
    }

    /**
     * Normalize a UK phone number to E.164 format.
     * Converts 07... → +447..., already +44 numbers are left as-is.
     */
    private normalizePhone(phone: string): string {
        if (!phone) return phone;
        let cleaned = phone.replace(/\s+/g, '').replace(/[^+\d]/g, '');
        // UK mobile numbers: 07... → +447...
        if (cleaned.startsWith('07') && cleaned.length === 11) {
            cleaned = '+44' + cleaned.substring(1);
        }
        // Numbers starting with 44 without + prefix
        if (cleaned.startsWith('44') && !cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }
        return cleaned;
    }

    async sendSms(to: string, body: string) {
        const normalizedTo = this.normalizePhone(to);
        try {
            const message = await this.client.messages.create({
                body,
                from: this.fromNumber,
                to: normalizedTo,
            });
            return message;
        } catch (error) {
            console.error('Failed to send SMS via Twilio', error);
            throw error; // Rethrow so BullMQ can retry the job
        }
    }
}
