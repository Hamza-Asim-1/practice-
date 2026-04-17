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
exports.PostcodesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PostcodesService = class PostcodesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkRoute(code) {
        const formattedCode = code.replace(/\s+/g, '').toUpperCase();
        const exact = await this.prisma.postcode.findUnique({
            where: { code: formattedCode }
        });
        if (exact)
            return exact;
        const outcode = code.trim().split(/\s+/)[0].toUpperCase();
        if (outcode !== formattedCode) {
            const outcodeMatch = await this.prisma.postcode.findUnique({
                where: { code: outcode }
            });
            if (outcodeMatch)
                return outcodeMatch;
        }
        const prefix = await this.prisma.postcode.findFirst({
            where: {
                code: { startsWith: formattedCode.substring(0, Math.min(4, formattedCode.length)) }
            },
            orderBy: { active: 'desc' }
        });
        return prefix;
    }
    async findAll() {
        return this.prisma.postcode.findMany();
    }
    async create(data) {
        data.code = data.code.replace(/\s+/g, '').toUpperCase();
        return this.prisma.postcode.create({ data });
    }
    async update(code, data) {
        return this.prisma.postcode.update({
            where: { code: code.replace(/\s+/g, '').toUpperCase() },
            data,
        });
    }
    async remove(code) {
        return this.prisma.postcode.delete({
            where: { code: code.replace(/\s+/g, '').toUpperCase() },
        });
    }
};
exports.PostcodesService = PostcodesService;
exports.PostcodesService = PostcodesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PostcodesService);
//# sourceMappingURL=postcodes.service.js.map