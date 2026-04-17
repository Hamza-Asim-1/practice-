import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
    }

    async createPaymentIntent(amount: number, metadata: Record<string, string>, currency: string = 'gbp') {
        return this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // convert to pence
            currency,
            metadata,
            automatic_payment_methods: { enabled: true },
        });
    }

    constructEvent(payload: Buffer, sig: string) {
        return this.stripe.webhooks.constructEvent(
            payload,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder',
        );
    }

    async retrievePaymentIntent(id: string) {
        return this.stripe.paymentIntents.retrieve(id);
    }
}
