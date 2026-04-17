import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Request } from 'express';

const extractJwtFromCookie = (req: Request) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['teza_token'];
    }
    return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: extractJwtFromCookie,
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'fallbackSecretForDevelopment',
        });
    }

    async validate(payload: any) {
        const user = await this.usersService.findById(payload.sub) as any;
        if (!user) {
            throw new UnauthorizedException();
        }

        // GATEKEEPING: If supplier, must be active
        if (user.role === 'SUPPLIER_ADMIN' && user.supplier?.status !== 'ACTIVE') {
            throw new UnauthorizedException('Your supplier account is no longer active. Please contact administration.');
        }

        // Return safe user object to append to req.user
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
}
