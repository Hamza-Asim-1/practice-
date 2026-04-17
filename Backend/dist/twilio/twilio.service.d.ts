export declare class TwilioService {
    private client;
    private fromNumber;
    constructor();
    private normalizePhone;
    sendSms(to: string, body: string): Promise<import("twilio/lib/rest/api/v2010/account/message").MessageInstance>;
}
