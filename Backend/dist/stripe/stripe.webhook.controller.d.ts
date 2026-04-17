import { StripeService } from './stripe.service';
import { OrdersService } from '../orders/orders.service';
import { Request } from 'express';
export declare class StripeWebhookController {
    private readonly stripeService;
    private readonly ordersService;
    constructor(stripeService: StripeService, ordersService: OrdersService);
    handleWebhook(sig: string, req: Request & {
        rawBody: Buffer;
    }): Promise<{
        received: boolean;
    }>;
}
