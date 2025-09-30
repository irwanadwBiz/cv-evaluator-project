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
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = require("fs");
const path = require("path");
const pdfParse = require('pdf-parse');
let mammoth;
try {
    mammoth = require('mammoth');
}
catch {
}
let FilesService = class FilesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async saveUpload(file, type) {
        const text = await this.extractText(file);
        const rec = await this.prisma.upload.create({
            data: {
                type,
                originalName: file.originalname,
                mimeType: file.mimetype,
                path: file.path,
                size: file.size,
                text,
            },
        });
        return rec;
    }
    async getUploadText(id) {
        const rec = await this.prisma.upload.findUnique({ where: { id } });
        return rec?.text ?? '';
    }
    async extractText(file) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.txt') {
            return fs.readFileSync(file.path, 'utf8');
        }
        if (ext === '.pdf') {
            try {
                const data = await pdfParse(fs.readFileSync(file.path));
                return data.text || null;
            }
            catch {
                return null;
            }
        }
        if (ext === '.docx' && mammoth) {
            try {
                const result = await mammoth.extractRawText({ path: file.path });
                return (result && result.value) ? result.value : null;
            }
            catch {
                return null;
            }
        }
        try {
            return fs.readFileSync(file.path, 'utf8');
        }
        catch {
            return null;
        }
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FilesService);
//# sourceMappingURL=files.service.js.map