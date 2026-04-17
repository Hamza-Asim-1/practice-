import Stripe from 'stripe';
export declare class StripeService {
    private stripe;
    constructor();
    createPaymentIntent(amount: number, metadata: Record<string, string>, currency?: string): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    constructEvent(payload: Buffer, sig: string): Stripe.Event;
    retrievePaymentIntent(id: string): Promise<Stripe.Response<Stripe.PaymentIntent>>;
}
