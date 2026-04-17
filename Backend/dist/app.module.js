"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const bullmq_1 = require("@nestjs/bullmq");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const products_module_1 = require("./products/products.module");
const postcodes_module_1 = require("./postcodes/postcodes.module");
const customers_module_1 = require("./customers/customers.module");
const suppliers_module_1 = require("./suppliers/suppliers.module");
const orders_module_1 = require("./orders/orders.module");
const stripe_module_1 = require("./stripe/stripe.module");
const twilio_module_1 = require("./twilio/twilio.module");
const tookan_module_1 = require("./tookan/tookan.module");
const jobs_module_1 = require("./jobs/jobs.module");
const categories_module_1 = require("./categories/categories.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                useFactory: async () => {
                    try {
                        const store = await (0, cache_manager_redis_yet_1.redisStore)({
                            password: process.env.REDIS_PASSWORD,
                            socket: {
                                host: process.env.REDIS_HOST || 'localhost',
                                port: parseInt(process.env.REDIS_PORT || '19474', 10),
                                tls: process.env.REDIS_TLS === 'true',
                                connectTimeout: 5000,
                            },
                        });
                        console.log('--- Redis Cache Enabled ---');
                        return { store };
                    }
                    catch (error) {
                        console.error('--- Redis Connection Failed: Falling back to Memory Caching ---');
                        return { ttl: 600 * 1000 };
                    }
                },
            }),
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379', 10),
                    password: process.env.REDIS_PASSWORD,
                    tls: process.env.REDIS_TLS === 'true' ? { rejectUnauthorized: false } : undefined,
                    maxRetriesPerRequest: null,
                    enableReadyCheck: false,
                    lazyConnect: true,
                    retryStrategy: (times) => {
                        if (times > 10) {
                            console.error(`[BullMQ] Redis reconnect failed after ${times} attempts. Giving up.`);
                            return null;
                        }
                        const delay = Math.min(times * 1000, 30000);
                        console.warn(`[BullMQ] Redis reconnecting in ${delay}ms (attempt ${times})...`);
                        return delay;
                    },
                },
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 50,
                }]),
            prisma_module_1.PrismaModule, auth_module_1.AuthModule, users_module_1.UsersModule, products_module_1.ProductsModule, postcodes_module_1.PostcodesModule, customers_module_1.CustomersModule, suppliers_module_1.SuppliersModule, orders_module_1.OrdersModule, stripe_module_1.StripeModule, twilio_module_1.TwilioModule, tookan_module_1.TookanModule, jobs_module_1.JobsModule, categories_module_1.CategoriesModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map