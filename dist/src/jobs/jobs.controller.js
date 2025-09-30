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
exports.JobsController = exports.JobResponseDto = exports.CreateJobDto = void 0;
const common_1 = require("@nestjs/common");
const jobs_service_1 = require("./jobs.service");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateJobDto {
}
exports.CreateJobDto = CreateJobDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ID of the uploaded CV file",
        example: "cmg51y1f000002zzoa5c3k1yq",
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobDto.prototype, "cvId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ID of the uploaded Project Report file",
        example: "cmg522pdf00012zzogmqny9bp",
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobDto.prototype, "reportId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Optional temperature parameter for evaluation",
        example: 0.7,
        required: false,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateJobDto.prototype, "temperature", void 0);
class JobResponseDto {
}
exports.JobResponseDto = JobResponseDto;
let JobsController = class JobsController {
    constructor(jobs) {
        this.jobs = jobs;
    }
    async create(body) {
        const { cvId, reportId, temperature } = body || {};
        if (!cvId || !reportId) {
            return { error: "cvId and reportId are required" };
        }
        const job = await this.jobs.enqueue(cvId, reportId, temperature ?? Number(process.env.TEMPERATURE ?? 0.2));
        return { jobId: job.id, status: job.status };
    }
};
exports.JobsController = JobsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    (0, swagger_1.ApiOperation)({ summary: "Create a new evaluation job" }),
    (0, swagger_1.ApiBody)({ type: CreateJobDto }),
    (0, swagger_1.ApiResponse)({
        status: 202,
        description: "Job accepted for processing",
        schema: {
            example: { jobId: "abc123", status: "queued" },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Missing cvId or reportId" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateJobDto]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "create", null);
exports.JobsController = JobsController = __decorate([
    (0, swagger_1.ApiTags)("evaluate"),
    (0, common_1.Controller)("evaluate"),
    __metadata("design:paramtypes", [jobs_service_1.JobsService])
], JobsController);
//# sourceMappingURL=jobs.controller.js.map