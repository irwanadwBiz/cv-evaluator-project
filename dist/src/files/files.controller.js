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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const files_service_1 = require("./files.service");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let FilesController = class FilesController {
    constructor(files) {
        this.files = files;
    }
    async upload(file, type) {
        if (!file)
            throw new common_1.BadRequestException("file is required");
        if (!type || !["CV", "REPORT", "OTHER"].includes(type))
            throw new common_1.BadRequestException("type must be CV or REPORT or OTHER");
        const rec = await this.files.saveUpload(file, type);
        return { id: rec.id, type: rec.type, name: rec.originalName };
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)("upload"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file", {
        storage: (0, multer_1.diskStorage)({
            destination: "./uploads",
            filename: (req, file, cb) => {
                const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
                cb(null, unique + (0, path_1.extname)(file.originalname));
            },
        }),
    })),
    (0, swagger_1.ApiOperation)({ summary: "Upload a file (CV, REPORT, OTHER)" }),
    (0, swagger_1.ApiConsumes)("multipart/form-data"),
    (0, swagger_1.ApiBody)({
        description: "Upload file with type",
        schema: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    format: "binary",
                },
                type: {
                    type: "string",
                    enum: ["CV", "REPORT", "OTHER"],
                },
            },
            required: ["file", "type"],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "File uploaded successfully" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Validation failed" }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)("type")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "upload", null);
exports.FilesController = FilesController = __decorate([
    (0, swagger_1.ApiTags)("files"),
    (0, common_1.Controller)("files"),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map