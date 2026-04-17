import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findSupplierApplications() {
        // Fetch all supplier profiles
        const suppliers = await this.prisma.supplier.findMany({
            include: {
                users: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        // Filter and map: 
        // 1. Must have a linked user
        // 2. Either the user is already a SUPPLIER_ADMIN
        // 3. Or the supplier status is PENDING (a new applicant)
        // This excludes retail CUSTOMERS who might have legacy/orphaned supplier records.
        return suppliers
            .filter(s => {
                if (!s.users || s.users.length === 0) return false;
                const user = s.users[0];
                
                // Keep if already a supplier admin
                if (user.role === 'SUPPLIER_ADMIN') return true;
                
                // Keep if it's a pending application from a customer
                if (user.role === 'CUSTOMER' && s.status === 'PENDING') return true;
                
                // Keep if suspended (so admin can see/manage/re-activate)
                if (s.status === 'SUSPENDED') return true;

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

    async updateSupplierStatus(userId: string, status: 'ACTIVE' | 'PENDING' | 'SUSPENDED') {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { supplier: true }
        });

        if (!user || !user.supplier) {
            throw new NotFoundException('Partner profile not found for this user.');
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

    async approveSupplier(userId: string, isApproved: boolean) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { supplier: true }
        });

        if (!user || !user.supplier) {
            throw new NotFoundException('User or Partner profile not found');
        }

        if (isApproved) {
            // Promote to Supplier Admin and Activate Supplier Profile
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
        } else {
            // Keep as Customer but Suspend Supplier Profile
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

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ 
            where: { id },
            include: { customer: true, supplier: true }
        });
    }

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany({ include: { customer: true, supplier: true } });
    }

    async createCustomer(data: { userId: string, firstName: string, lastName: string, phone: string }) {
        return this.prisma.customer.create({
            data: {
                userId: data.userId,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
            }
        });
    }

    async createSupplier(data: { 
        userId: string, 
        email: string, 
        name: string, 
        contactName: string, 
        phone: string, 
        addressLine1: string,
        addressLine2?: string,
        city: string,
        area: string,
        postcode: string,
        hmcCertNumber?: string 
    }) {
        // Create the supplier first
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
                    create: {} // Automatically creates an empty linked SupplierApplication record
                }
            }
        });

        // The user was connected during supplier creation, but let's return the supplier
        return supplier;
    }

    async adminCreateSupplier(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        area: string;
        postcode: string;
        businessName: string;
        hmcCertNumber?: string;
    }) {
        // 1. Check email uniqueness
        const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new ConflictException('A user with this email already exists.');
        }

        // 2. Hash the password
        const passwordHash = await bcrypt.hash(data.password, 10);

        // 3. Create User + Supplier profile atomically
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
                    status: 'ACTIVE', // Admin-created accounts skip approval
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
}
