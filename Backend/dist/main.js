"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const prisma_exception_filter_1 = require("./common/filters/prisma-exception.filter");
console.log("--- Starting Backend ---");
console.log("ENV PORT:", process.env.PORT);
process.on("uncaughtException", (err) => {
    console.error("[Process] Uncaught Exception (non-fatal):", err.message);
});
process.on("unhandledRejection", (reason) => {
    console.error("[Process] Unhandled Rejection (non-fatal):", reason);
});
async function bootstrap() {
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            rawBody: true,
        });
        const expressApp = app.getHttpAdapter().getInstance();
        expressApp.set('trust proxy', 1);
        app.enableCors({
            origin: ["http://localhost:5173", "https://tezameat.web.app"],
            credentials: true,
        });
        const { httpAdapter } = app.get(core_1.HttpAdapterHost);
        app.useGlobalFilters(new prisma_exception_filter_1.PrismaExceptionFilter(httpAdapter));
        app.use((0, cookie_parser_1.default)());
        const port = process.env.PORT || 5050;
        await app.listen(port);
        console.log(`Backend is listening on port: ${port}`);
    }
    catch (error) {
        console.error("Backend failed to start:", error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map