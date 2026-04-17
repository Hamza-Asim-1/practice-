import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: (() => {
        if (!process.env.JWT_SECRET) {
          console.warn('⚠️  WARNING: JWT_SECRET is not set! Using insecure fallback. Set JWT_SECRET in your .env for production.');
        }
        return process.env.JWT_SECRET || 'fallbackSecretForDevelopment';
      })(),
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule { }
