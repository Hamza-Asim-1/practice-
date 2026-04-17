import { PostcodesService } from './postcodes.service';
import { Prisma } from '@prisma/client';
export declare class PostcodesController {
    private readonly postcodesService;
    constructor(postcodesService: PostcodesService);
    checkCoverage(code: string): Promise<{
        code: string;
        active: boolean;
        deliveryRadiusMiles: Prisma.Decimal | null;
        deliveryFee: Prisma.Decimal;
        createdAt: Date;
        updatedAt: Date;
        area: string | null;
        city: string | null;
        minimumOrder: Prisma.Decimal;
    }>;
    findAll(req: any): Promise<{
        code: string;
        active: boolean;
        deliveryRadiusMiles: Prisma.Decimal | null;
        deliveryFee: Prisma.Decimal;
        createdAt: Date;
        updatedAt: Date;
        area: string | null;
        city: string | null;
        minimumOrder: Prisma.Decimal;
    }[]>;
    create(createPostcodeDto: Prisma.PostcodeCreateInput, req: any): Promise<{
        code: string;
        active: boolean;
        deliveryRadiusMiles: Prisma.Decimal | null;
        deliveryFee: Prisma.Decimal;
        createdAt: Date;
        updatedAt: Date;
        area: string | null;
        city: string | null;
        minimumOrder: Prisma.Decimal;
    }>;
    update(code: string, updatePostcodeDto: Prisma.PostcodeUpdateInput, req: any): Promise<{
        code: string;
        active: boolean;
        deliveryRadiusMiles: Prisma.Decimal | null;
        deliveryFee: Prisma.Decimal;
        createdAt: Date;
        updatedAt: Date;
        area: string | null;
        city: string | null;
        minimumOrder: Prisma.Decimal;
    }>;
    remove(code: string, req: any): Promise<{
        code: string;
        active: boolean;
        deliveryRadiusMiles: Prisma.Decimal | null;
        deliveryFee: Prisma.Decimal;
        createdAt: Date;
        updatedAt: Date;
        area: string | null;
        city: string | null;
        minimumOrder: Prisma.Decimal;
    }>;
}
