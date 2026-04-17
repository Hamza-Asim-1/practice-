"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    usersService;
    jwtService;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.passwordHash)) {
            if (user.role === 'SUPPLIER_ADMIN') {
                const fullUser = await this.usersService.findById(user.id);
                if (fullUser?.supplier?.status !== 'ACTIVE') {
                    throw new common_1.UnauthorizedException('Your supplier account is pending approval from the administration. You will be notified once activated.');
                }
            }
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
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
    async register(data) {
        const existingUser = await this.usersService.findByEmail(data.email);
        if (existingUser) {
            throw new common_1.ConflictException('This email is already registered. Please sign in instead.');
        }
        const ALLOWED_REGISTRATION_ROLES = ['CUSTOMER', 'SUPPLIER_ADMIN'];
        const requestedRole = data.role || 'CUSTOMER';
        if (!ALLOWED_REGISTRATION_ROLES.includes(requestedRole)) {
            throw new common_1.ConflictException('Invalid registration role. Only CUSTOMER and SUPPLIER_ADMIN registrations are allowed.');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.usersService.create({
            email: data.email,
            role: requestedRole,
            passwordHash: hashedPassword,
        });
        if (user.role === 'CUSTOMER') {
            await this.usersService.createCustomer({
                userId: user.id,
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                phone: data.phone || '',
            });
        }
        else if (user.role === 'SUPPLIER_ADMIN') {
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
        return this.login(user);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map