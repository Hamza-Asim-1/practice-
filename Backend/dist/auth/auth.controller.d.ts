import type { Response } from 'express';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: any, res: Response): Promise<{
        success: boolean;
        user: {
            id: any;
            email: any;
            role: any;
        };
        message: string;
    }>;
    login(loginDto: any, res: Response): Promise<{
        success: boolean;
        user: {
            id: any;
            email: any;
            role: any;
        };
        message: string;
    }>;
    logout(res: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    getProfile(req: any): any;
}
