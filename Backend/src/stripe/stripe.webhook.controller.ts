import { Controller, Post, Headers, Req, BadRequestException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { OrdersService } from '../orders/orders.service';
import { Request } from 'express';

@Controller('stripe')
export class StripeWebhookController {
    constructor(
        private readonly stripeService: StripeService,
        private readonly ordersService: OrdersService,
    ) { }

    @Post('webhook')
    async handleWebhook(
        @Headers('stripe-signature') sig: string,
        @Req() req: Request & { rawBody: Buffer },
    ) {
        if (!sig) {
            throw new BadRequestException('Missing stripe-signature header');
        }

        let event;
        try {
            event = this.stripeService.constructEvent(req.rawBody, sig);
        } catch (err) {
            console.error(`❌ Webhook signature verification failed: ${err.message}`);
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;
            console.log(`✅ PaymentIntent was successful for order: ${orderId}`);
            
            if (orderId) {
                await this.ordersService.confirmOrder(orderId);
            }
        }

        if (event.type === 'payment_intent.payment_failed') {
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;
            console.error(`❌ PaymentIntent failed for order: ${orderId}`);
            
            if (orderId) {
                try {
                    await this.ordersService.updateStatus(orderId, 'CANCELLED' as any);
                    console.log(`[Webhook] Order ${orderId} cancelled due to payment failure.`);
                } catch (e) {
                    console.error(`[Webhook] Failed to cancel order ${orderId}:`, e);
                }
            }
        }

        return { received: true };
    }
}
