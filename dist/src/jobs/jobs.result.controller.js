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
exports.JobsResultController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jobs_service_1 = require("./jobs.service");
let JobsResultController = class JobsResultController {
    constructor(jobs) {
        this.jobs = jobs;
    }
    async get(id) {
        const job = await this.jobs.find(id);
        if (!job)
            return { error: "not found" };
        if (job.status === "queued" || job.status === "processing") {
            return { id: job.id, status: job.status };
        }
        if (job.status === "failed") {
            return { id: job.id, status: job.status, error: job.error };
        }
        const raw = job.result;
        const transformed = raw
            ? {
                cv_match_rate: raw.cv?.weighted?.percentage
                    ? raw.cv.weighted.percentage / 100
                    : null,
                cv_feedback: raw.cv?.analysis || null,
                project_score: raw.project?.weighted?.weighted || null,
                project_feedback: raw.project?.feedback?.[0] || "No project feedback available",
                overall_summary: raw.overall?.summary?.join(" ") || null,
            }
            : null;
        return { id: job.id, status: job.status, result: transformed };
    }
};
exports.JobsResultController = JobsResultController;
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get evaluation job result" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Job ID", type: String }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Job details (transformed result)",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Job not found" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobsResultController.prototype, "get", null);
exports.JobsResultController = JobsResultController = __decorate([
    (0, swagger_1.ApiTags)("result"),
    (0, common_1.Controller)("result"),
    __metadata("design:paramtypes", [jobs_service_1.JobsService])
], JobsResultController);
//# sourceMappingURL=jobs.result.controller.js.map