import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Postcode } from '@prisma/client';
export declare class PostcodesService {
    private prisma;
    constructor(prisma: PrismaService);
    checkRoute(code: string): Promise<Postcode | null>;
    findAll(): Promise<Postcode[]>;
    create(data: Prisma.PostcodeCreateInput): Promise<Postcode>;
    update(code: string, data: Prisma.PostcodeUpdateInput): Promise<Postcode>;
    remove(code: string): Promise<Postcode>;
}
