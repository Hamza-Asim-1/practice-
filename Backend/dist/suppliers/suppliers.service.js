"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SuppliersService = class SuppliersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.supplier.findMany();
    }
    async findOne(id) {
        return this.prisma.supplier.findUnique({
            where: { id }
        });
    }
    async create(data) {
        return this.prisma.supplier.create({ data });
    }
    async updateStatus(id, status) {
        return this.prisma.supplier.update({
            where: { id },
            data: { status },
        });
    }
    async getPendingApplications() {
        return this.prisma.supplierApplication.findMany({
            where: {
                supplier: { status: 'PENDING' }
            },
            include: {
                supplier: true
            }
        });
    }
    async decideApplication(supplierId, decision, opsAdminId, notes) {
        const status = decision === 'APPROVED' ? 'ACTIVE' : 'SUSPENDED';
        await this.prisma.supplierApplication.update({
            where: { supplierId },
            data: {
                decisionDate: new Date(),
                decidedById: opsAdminId,
                notes
            }
        });
        return this.prisma.supplier.update({
            where: { id: supplierId },
            data: { status }
        });
    }
    async getInventory(supplierId) {
        return this.prisma.product.findMany({
            where: {
                deletedAt: null,
                approvalStatus: 'APPROVED',
            },
            include: {
                stock: true,
                categoryObj: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map