import "dotenv/config";
import { NestFactory, HttpAdapterHost } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import { PrismaExceptionFilter } from "./common/filters/prisma-exception.filter";

console.log("--- Starting Backend ---");
console.log("ENV PORT:", process.env.PORT);

// Prevent Redis ETIMEDOUT / connection errors from crashing the entire process.
// Node.js exits with error if an EventEmitter emits 'error' with no listener.
process.on("uncaughtException", (err: Error) => {
  // Log but do NOT exit — let NestJS keep running with in-memory fallback
  console.error("[Process] Uncaught Exception (non-fatal):", err.message);
});

process.on("unhandledRejection", (reason: unknown) => {
  console.error("[Process] Unhandled Rejection (non-fatal):", reason);
});

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      rawBody: true,
    });

    // Trust proxy is required for 'Secure' cookies to work on Vercel
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);

    app.enableCors({
      origin: ["http://localhost:5173", "https://tezameat.web.app"],
      credentials: true,
    });

    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new PrismaExceptionFilter(httpAdapter));
    //new change
    app.use(cookieParser());
    const port = process.env.PORT || 5050;
    await app.listen(port);
    console.log(`Backend is listening on port: ${port}`);
  } catch (error) {
    console.error("Backend failed to start:", error);
    process.exit(1);
  }
}
bootstrap();
