import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.passwordHash)) {
            
            // GATEKEEPING: If supplier, must be active
            if (user.role === 'SUPPLIER_ADMIN') {
                const fullUser = await this.usersService.findById(user.id) as any;
                if (fullUser?.supplier?.status !== 'ACTIVE') {
                    throw new UnauthorizedException('Your supplier account is pending approval from the administration. You will be notified once activated.');
                }
            }

            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        };
    }

    async register(data: any) {
        // Step 0: Check if user already exists
        const existingUser = await this.usersService.findByEmail(data.email);
        if (existingUser) {
            throw new ConflictException('This email is already registered. Please sign in instead.');
        }

        // SECURITY: Only allow self-registration for CUSTOMER and SUPPLIER_ADMIN.
        // Admin roles (OPS_ADMIN, SUPER_ADMIN) must be assigned by existing admins.
        const ALLOWED_REGISTRATION_ROLES = ['CUSTOMER', 'SUPPLIER_ADMIN'];
        const requestedRole = data.role || 'CUSTOMER';
        if (!ALLOWED_REGISTRATION_ROLES.includes(requestedRole)) {
            throw new ConflictException('Invalid registration role. Only CUSTOMER and SUPPLIER_ADMIN registrations are allowed.');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Step 1: Create the User (auth only — email, password, role)
        const user = await this.usersService.create({
            email: data.email,
            role: requestedRole,
            passwordHash: hashedPassword,
        });

        // Step 2: Create the role-specific profile
        if (user.role === 'CUSTOMER') {
            // Customer profile — firstName, lastName, phone live here
            await this.usersService.createCustomer({
                userId: user.id,
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                phone: data.phone || '',
            });
        } else if (user.role === 'SUPPLIER_ADMIN') {
            // Supplier profile — shop info, HMC cert, PENDING by default
            await this.usersService.createSupplier({
                userId: user.id,
                email: data.email,
                name: data.businessName || data.supplierName || 'New Shop',
                contactName: data.firstName ? `${data.firstName} ${data.lastName}`.trim() : 'Shop Admin',
                phone: data.phone || '',
                addressLine1: data.addressLine1 || '',
                addressLine2: data.addressLine2,
                city: data.city || '',
                area: data.area || '',
                postcode: data.postcode || '',
                hmcCertNumber: data.hmcCertNumber,
            });
        }

        // Step 3: Auto-login after registration
        return this.login(user);
    }
}
