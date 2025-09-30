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
exports.RagService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    return dot / ((Math.sqrt(na) || 1) * (Math.sqrt(nb) || 1));
}
function hashEmbedding(text, dim = 256) {
    const vec = new Array(dim).fill(0);
    const toks = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
    for (const t of toks) {
        let h = 2166136261;
        for (let i = 0; i < t.length; i++) {
            h ^= t.charCodeAt(i);
            h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
            h = h >>> 0;
        }
        const idx = h % dim;
        vec[idx] += 1;
    }
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map((v) => v / norm);
}
let RagService = class RagService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async retrieve(query, topK = 2) {
        const q = hashEmbedding(query);
        const docs = await this.prisma.vectorDoc.findMany();
        const scored = docs.map((d) => ({
            doc: d,
            score: cosine(q, d.embedding || []),
        }));
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, topK).map((s) => ({
            kind: s.doc.kind,
            title: s.doc.title,
            content: s.doc.content,
            score: s.score,
        }));
    }
};
exports.RagService = RagService;
exports.RagService = RagService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RagService);
//# sourceMappingURL=rag.service.js.map