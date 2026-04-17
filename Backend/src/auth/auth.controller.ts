import { Controller, Post, Body, Get, UseGuards, Request, Res, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() body: any, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.register({
            email: body.email,
            password: body.password,
            role: body.role,
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phone,
            businessName: body.businessName,
            supplierName: body.supplierName,
            addressLine1: body.addressLine1,
            addressLine2: body.addressLine2,
            city: body.city,
            area: body.area,
            postcode: body.postcode,
            hmcCertNumber: body.hmcCertNumber,
        });
        
        res.cookie('teza_token', result.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { 
            success: true, 
            user: result.user, 
            message: 'Registration successful! Welcome to TEZA.' 
        };
    }

    @Post('login')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async login(@Body() loginDto: any, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        
        const tokenData = await this.authService.login(user);
        
        res.cookie('teza_token', tokenData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { 
            success: true, 
            user: tokenData.user,
            message: 'Welcome back! Authentication successful.'
        };
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('teza_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });
        return { success: true, message: 'Logged out successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Request() req) {
        return req.user;
    }
}
