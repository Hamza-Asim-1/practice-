import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { redisStore } from 'cache-manager-redis-yet';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { PostcodesModule } from './postcodes/postcodes.module';
import { CustomersModule } from './customers/customers.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { OrdersModule } from './orders/orders.module';
import { StripeModule } from './stripe/stripe.module';
import { TwilioModule } from './twilio/twilio.module';
import { TookanModule } from './tookan/tookan.module';
import { JobsModule } from './jobs/jobs.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        try {
          const store = await redisStore({
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
        } catch (error) {
          console.error('--- Redis Connection Failed: Falling back to Memory Caching ---');
          return { ttl: 600 * 1000 }; // In-memory fallback
        }
      },
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_TLS === 'true' ? { rejectUnauthorized: false } : undefined,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
        retryStrategy: (times: number) => {
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
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 50, // Increased from 10 to 50 to support modern SPA behavior
    }]),
    PrismaModule, AuthModule, UsersModule, ProductsModule, PostcodesModule, CustomersModule, SuppliersModule, OrdersModule, StripeModule, TwilioModule, TookanModule, JobsModule, CategoriesModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
