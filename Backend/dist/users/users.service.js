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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.user.create({ data });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async findSupplierApplications() {
        const suppliers = await this.prisma.supplier.findMany({
            include: {
                users: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return suppliers
            .filter(s => {
            if (!s.users || s.users.length === 0)
                return false;
            const user = s.users[0];
            if (user.role === 'SUPPLIER_ADMIN')
                return true;
            if (user.role === 'CUSTOMER' && s.status === 'PENDING')
                return true;
            if (s.status === 'SUSPENDED')
                return true;
            return false;
        })
            .map(s => {
            const user = s.users[0];
            return {
                id: user?.id,
                supplierId: s.id,
                email: s.email,
                firstName: s.contactName.split(' ')[0] || '',
                lastName: s.contactName.split(' ').slice(1).join(' ') || '',
                businessName: s.name,
                phone: s.phone,
                role: user?.role || 'CUSTOMER',
                supplierStatus: s.status,
                hmcCertNumber: s.hmcCertNumber,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt,
            };
        });
    }
    async updateSupplierStatus(userId, status) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { supplier: true }
        });
        if (!user || !user.supplier) {
            throw new common_1.NotFoundException('Partner profile not found for this user.');
        }
        const updated = await this.prisma.supplier.update({
            where: { id: user.supplier.id },
            data: { status },
        });
        return {
            success: true,
            message: `Partner status transitioned to ${status}.`,
            id: updated.id,
            email: updated.email,
            supplierStatus: updated.status,
        };
    }
    async approveSupplier(userId, isApproved) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { supplier: true }
        });
        if (!user || !user.supplier) {
            throw new common_1.NotFoundException('User or Partner profile not found');
        }
        if (isApproved) {
            await this.prisma.$transaction([
                this.prisma.user.update({
                    where: { id: userId },
                    data: { role: 'SUPPLIER_ADMIN' }
                }),
                this.prisma.supplier.update({
                    where: { id: user.supplier.id },
                    data: { status: 'ACTIVE' }
                })
            ]);
            return {
                success: true,
                message: "Application approved. Partner promoted to Supplier Admin.",
                status: 'ACTIVE'
            };
        }
        else {
            await this.prisma.supplier.update({
                where: { id: user.supplier.id },
                data: { status: 'SUSPENDED' }
            });
            return {
                success: true,
                message: "Lifecycle suspended. Partner access restricted.",
                status: 'SUSPENDED'
            };
        }
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: { customer: true, supplier: true }
        });
    }
    async findAll() {
        return this.prisma.user.findMany({ include: { customer: true, supplier: true } });
    }
    async createCustomer(data) {
        return this.prisma.customer.create({
            data: {
                userId: data.userId,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
            }
        });
    }
    async createSupplier(data) {
        const supplier = await this.prisma.supplier.create({
            data: {
                name: data.name,
                contactName: data.contactName,
                email: data.email,
                phone: data.phone,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2,
                city: data.city,
                area: data.area,
                postcode: data.postcode,
                hmcCertNumber: (data.hmcCertNumber && data.hmcCertNumber.trim() !== '') ? data.hmcCertNumber : null,
                status: 'PENDING',
                users: {
                    connect: { id: data.userId }
                },
                application: {
                    create: {}
                }
            }
        });
        return supplier;
    }
    async adminCreateSupplier(data) {
        const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new common_1.ConflictException('A user with this email already exists.');
        }
        const passwordHash = await bcrypt.hash(data.password, 10);
        const { user, supplier } = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    passwordHash,
                    role: 'SUPPLIER_ADMIN',
                },
            });
            const supplier = await tx.supplier.create({
                data: {
                    name: data.businessName,
                    contactName: `${data.firstName} ${data.lastName}`.trim(),
                    email: data.email,
                    phone: data.phone,
                    addressLine1: data.addressLine1,
                    addressLine2: data.addressLine2,
                    city: data.city,
                    area: data.area,
                    postcode: data.postcode,
                    hmcCertNumber: data.hmcCertNumber || null,
                    status: 'ACTIVE',
                    users: { connect: { id: user.id } },
                    application: { create: {} },
                },
            });
            return { user, supplier };
        });
        return {
            success: true,
            message: `Supplier account for "${data.businessName}" created successfully.`,
            userId: user.id,
            supplierId: supplier.id,
            email: user.email,
            businessName: supplier.name,
            status: supplier.status,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map