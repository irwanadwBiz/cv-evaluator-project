"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineModule = void 0;
const common_1 = require("@nestjs/common");
const pipeline_service_1 = require("./pipeline.service");
const rag_service_1 = require("./rag.service");
const llm_service_1 = require("./llm.service");
const prisma_module_1 = require("../prisma/prisma.module");
const files_module_1 = require("../files/files.module");
const config_1 = require("@nestjs/config");
let PipelineModule = class PipelineModule {
};
exports.PipelineModule = PipelineModule;
exports.PipelineModule = PipelineModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, files_module_1.FilesModule, config_1.ConfigModule],
        providers: [pipeline_service_1.PipelineService, rag_service_1.RagService, llm_service_1.LlmService],
        exports: [pipeline_service_1.PipelineService],
    })
], PipelineModule);
//# sourceMappingURL=pipeline.module.js.map