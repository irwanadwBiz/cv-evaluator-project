"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const origins = (process.env.CORS_ORIGINS || "").split(",").filter(Boolean);
    app.enableCors({
        origin: origins.length ? origins : true,
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle("CV Evaluator API")
        .setDescription("API documentation for CV Evaluator project")
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api-docs", app, document);
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port);
    console.log(`Server listening on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map