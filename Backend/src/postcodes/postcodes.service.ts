import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Postcode } from '@prisma/client';

@Injectable()
export class PostcodesService {
    constructor(private prisma: PrismaService) { }

    async checkRoute(code: string): Promise<Postcode | null> {
        const formattedCode = code.replace(/\s+/g, '').toUpperCase();
        
        // 1. Try exact match first (could be outcode like 'E1' or full postcode like 'E17BB')
        const exact = await this.prisma.postcode.findUnique({
            where: { code: formattedCode }
        });

        if (exact) return exact;

        // 2. Try outcode-only match (first part of the postcode before the space)
        //    e.g., 'E1 7BB' → 'E1', or 'IG11 7BT' → 'IG11'
        const outcode = code.trim().split(/\s+/)[0].toUpperCase();
        if (outcode !== formattedCode) {
            const outcodeMatch = await this.prisma.postcode.findUnique({
                where: { code: outcode }
            });
            if (outcodeMatch) return outcodeMatch;
        }

        // 3. Fallback to prefix matching
        const prefix = await this.prisma.postcode.findFirst({
            where: {
                code: { startsWith: formattedCode.substring(0, Math.min(4, formattedCode.length)) }
            },
            orderBy: { active: 'desc' } // Prefer active ones if multiple exist
        });

        return prefix;
    }

    async findAll(): Promise<Postcode[]> {
        return this.prisma.postcode.findMany();
    }

    async create(data: Prisma.PostcodeCreateInput): Promise<Postcode> {
        // Format to upper case and remove spaces
        data.code = data.code.replace(/\s+/g, '').toUpperCase();
        return this.prisma.postcode.create({ data });
    }

    async update(code: string, data: Prisma.PostcodeUpdateInput): Promise<Postcode> {
        return this.prisma.postcode.update({
            where: { code: code.replace(/\s+/g, '').toUpperCase() },
            data,
        });
    }

    async remove(code: string): Promise<Postcode> {
        return this.prisma.postcode.delete({
            where: { code: code.replace(/\s+/g, '').toUpperCase() },
        });
    }
}
