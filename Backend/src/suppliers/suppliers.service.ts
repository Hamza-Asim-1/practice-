import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Supplier, SupplierStatus } from '@prisma/client';

@Injectable()
export class SuppliersService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<Supplier[]> {
        return this.prisma.supplier.findMany();
    }

    async findOne(id: string): Promise<Supplier | null> {
        return this.prisma.supplier.findUnique({
            where: { id }
        });
    }

    async create(data: Prisma.SupplierCreateInput): Promise<Supplier> {
        return this.prisma.supplier.create({ data });
    }

    async updateStatus(id: string, status: SupplierStatus): Promise<Supplier> {
        return this.prisma.supplier.update({
            where: { id },
            data: { status },
        });
    }

    // --- Application Management (OPS_ADMIN) ---

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

    async decideApplication(supplierId: string, decision: 'APPROVED' | 'REJECTED', opsAdminId: string, notes?: string) {
        const status = decision === 'APPROVED' ? 'ACTIVE' : 'SUSPENDED';

        // Update the application record
        await this.prisma.supplierApplication.update({
            where: { supplierId },
            data: {
                decisionDate: new Date(),
                decidedById: opsAdminId,
                notes
            }
        });

        // Update the supplier status
        return this.prisma.supplier.update({
            where: { id: supplierId },
            data: { status }
        });
    }

    async getInventory(supplierId: string) {
        // TODO: Filter by supplierId when Product schema adds a supplier FK.
        // Currently Product has no direct supplier relationship, so we return
        // all approved, non-deleted products. This is a known schema limitation.
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
}
