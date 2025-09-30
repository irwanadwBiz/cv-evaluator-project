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
exports.PipelineService = void 0;
const common_1 = require("@nestjs/common");
const files_service_1 = require("../files/files.service");
const rag_service_1 = require("./rag.service");
const llm_service_1 = require("./llm.service");
const scoring_1 = require("./scoring");
let PipelineService = class PipelineService {
    constructor(files, rag, llm) {
        this.files = files;
        this.rag = rag;
        this.llm = llm;
    }
    async run(cvId, reportId, temperature, context) {
        const [cvText, reportText] = await Promise.all([
            this.files.getUploadText(cvId),
            this.files.getUploadText(reportId),
        ]);
        const jobCtx = context?.cvContext || "";
        const rubricCtx = context?.projectContext || "";
        const extracted = await this.llm.extractFromCV(cvText || "");
        const { analysis, skillOverlap } = await this.llm.compareToJob(extracted, jobCtx);
        const techMatch = (0, scoring_1.clamp15)(Math.max(1, Math.min(5, 2 + Math.round(skillOverlap.length / 2))));
        const exp = (0, scoring_1.clamp15)(extracted.years >= 5
            ? 5
            : extracted.years >= 3
                ? 4
                : extracted.years >= 2
                    ? 3
                    : extracted.years >= 1
                        ? 2
                        : 1);
        const ach = (0, scoring_1.clamp15)((extracted.achievements?.length || 0) >= 3
            ? 4
            : (extracted.achievements?.length || 0) >= 1
                ? 3
                : 2);
        const culture = (0, scoring_1.clamp15)((extracted.softSkills?.length || 0) >= 3
            ? 4
            : (extracted.softSkills?.length || 0) >= 1
                ? 3
                : 2);
        const cvScores = {
            technicalMatch: techMatch,
            experience: exp,
            achievements: ach,
            culture,
        };
        const cvAgg = (0, scoring_1.aggregateCV)(cvScores);
        const projEval = await this.llm.evaluateProject(reportText || "", rubricCtx);
        const projScores = {
            correctness: projEval.scores.correctness,
            codeQuality: projEval.scores.codeQuality,
            resilience: projEval.scores.resilience,
            documentation: projEval.scores.documentation,
            creativity: projEval.scores.creativity,
        };
        const projAgg = (0, scoring_1.aggregateProject)(projScores);
        const summary = [
            `CV match is ${cvAgg.percentage.toFixed(1)}%. Strong overlaps: ${skillOverlap.slice(0, 5).join(", ") || "none obvious"}.`,
            `Project scoring indicates correctness=${projScores.correctness}, quality=${projScores.codeQuality}, resilience=${projScores.resilience}.`,
            ...projEval.feedback.slice(0, 2),
            `Recommendation: focus on ${skillOverlap.length < 3 ? "strengthening core backend & AI integration" : "depth and testing"} in the short term.`,
        ];
        return {
            cv: {
                extracted,
                scores: cvScores,
                weighted: cvAgg,
                analysis,
            },
            project: {
                scores: projScores,
                weighted: projAgg,
                feedback: projEval.feedback,
            },
            overall: {
                summary,
            },
        };
    }
};
exports.PipelineService = PipelineService;
exports.PipelineService = PipelineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [files_service_1.FilesService,
        rag_service_1.RagService,
        llm_service_1.LlmService])
], PipelineService);
//# sourceMappingURL=pipeline.service.js.map