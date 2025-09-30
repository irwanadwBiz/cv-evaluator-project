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
var JobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const pipeline_service_1 = require("../pipeline/pipeline.service");
const rag_service_1 = require("../pipeline/rag.service");
let JobsService = JobsService_1 = class JobsService {
    constructor(prisma, pipeline, rag) {
        this.prisma = prisma;
        this.pipeline = pipeline;
        this.rag = rag;
        this.logger = new common_1.Logger(JobsService_1.name);
        this.loopHandle = null;
        this.running = false;
    }
    async onModuleInit() {
        const fs = require("fs");
        if (!fs.existsSync("./uploads"))
            fs.mkdirSync("./uploads", { recursive: true });
        this.startLoop();
    }
    startLoop() {
        if (this.loopHandle)
            return;
        const tick = async () => {
            if (this.running)
                return;
            this.running = true;
            try {
                const job = await this.prisma.job.findFirst({
                    where: { status: client_1.JobStatus.queued },
                });
                if (job) {
                    await this.process(job.id);
                }
            }
            catch (e) {
                this.logger.error("Loop error", e);
            }
            finally {
                this.running = false;
                this.loopHandle = setTimeout(tick, 1000);
            }
        };
        this.loopHandle = setTimeout(tick, 200);
    }
    async enqueue(cvId, reportId, temperature = 0.2) {
        const job = await this.prisma.job.create({
            data: { cvId, reportId, temperature, status: client_1.JobStatus.queued },
        });
        return job;
    }
    async find(id) {
        return this.prisma.job.findUnique({ where: { id } });
    }
    async process(id) {
        this.logger.log(`Processing job ${id}`);
        let job = await this.prisma.job.update({
            where: { id },
            data: { status: client_1.JobStatus.processing },
        });
        try {
            const cvContext = await this.rag.retrieve("cv scoring rubric", 1);
            const projectContext = await this.rag.retrieve("project scoring rubric", 1);
            await new Promise((res) => setTimeout(res, 1000 + Math.random() * 1000));
            const result = await this.pipeline.run(job.cvId, job.reportId, job.temperature, {
                cvContext: cvContext.map((c) => c.content).join("\n"),
                projectContext: projectContext.map((c) => c.content).join("\n"),
            });
            job = await this.prisma.job.update({
                where: { id },
                data: { status: client_1.JobStatus.completed, result },
            });
            this.logger.log(`Completed job ${id}`);
        }
        catch (e) {
            const retries = (job.retries ?? 0) + 1;
            const max = Number(process.env.MAX_RETRIES ?? 3);
            const errMsg = e.message || "unknown error";
            if (retries <= max) {
                await this.prisma.job.update({
                    where: { id },
                    data: { retries, status: client_1.JobStatus.queued, error: errMsg },
                });
                this.logger.warn(`Job ${id} failed attempt ${retries}, re-queued: ${errMsg}`);
            }
            else {
                await this.prisma.job.update({
                    where: { id },
                    data: { retries, status: client_1.JobStatus.failed, error: errMsg },
                });
                this.logger.error(`Job ${id} failed permanently: ${errMsg}`);
            }
        }
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = JobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pipeline_service_1.PipelineService,
        rag_service_1.RagService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map