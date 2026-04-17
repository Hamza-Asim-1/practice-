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
exports.StripeWebhookController = void 0;
const common_1 = require("@nestjs/common");
const stripe_service_1 = require("./stripe.service");
const orders_service_1 = require("../orders/orders.service");
let StripeWebhookController = class StripeWebhookController {
    stripeService;
    ordersService;
    constructor(stripeService, ordersService) {
        this.stripeService = stripeService;
        this.ordersService = ordersService;
    }
    async handleWebhook(sig, req) {
        if (!sig) {
            throw new common_1.BadRequestException('Missing stripe-signature header');
        }
        let event;
        try {
            event = this.stripeService.constructEvent(req.rawBody, sig);
        }
        catch (err) {
            console.error(`❌ Webhook signature verification failed: ${err.message}`);
            throw new common_1.BadRequestException(`Webhook Error: ${err.message}`);
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
                    await this.ordersService.updateStatus(orderId, 'CANCELLED');
                    console.log(`[Webhook] Order ${orderId} cancelled due to payment failure.`);
                }
                catch (e) {
                    console.error(`[Webhook] Failed to cancel order ${orderId}:`, e);
                }
            }
        }
        return { received: true };
    }
};
exports.StripeWebhookController = StripeWebhookController;
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StripeWebhookController.prototype, "handleWebhook", null);
exports.StripeWebhookController = StripeWebhookController = __decorate([
    (0, common_1.Controller)('stripe'),
    __metadata("design:paramtypes", [stripe_service_1.StripeService,
        orders_service_1.OrdersService])
], StripeWebhookController);
//# sourceMappingURL=stripe.webhook.controller.js.map