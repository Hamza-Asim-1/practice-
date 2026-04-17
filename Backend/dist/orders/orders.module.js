"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const orders_controller_1 = require("./orders.controller");
const orders_service_1 = require("./orders.service");
const stripe_module_1 = require("../stripe/stripe.module");
const twilio_module_1 = require("../twilio/twilio.module");
const tookan_module_1 = require("../tookan/tookan.module");
const users_module_1 = require("../users/users.module");
const common_2 = require("@nestjs/common");
const postcodes_module_1 = require("../postcodes/postcodes.module");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({ name: 'notifications' }),
            bullmq_1.BullModule.registerQueue({ name: 'deliveries' }),
            (0, common_2.forwardRef)(() => stripe_module_1.StripeModule), twilio_module_1.TwilioModule, tookan_module_1.TookanModule, users_module_1.UsersModule,
            postcodes_module_1.PostcodesModule
        ],
        controllers: [orders_controller_1.OrdersController],
        providers: [orders_service_1.OrdersService],
        exports: [orders_service_1.OrdersService]
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map