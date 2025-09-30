import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { JobStatus } from '@prisma/client';
import { PipelineService } from '@/pipeline/pipeline.service';

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);
  private loopHandle: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private prisma: PrismaService, private pipeline: PipelineService) {}

  async onModuleInit() {
    // Ensure uploads dir exists
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads', { recursive: true });
    // Start background loop
    this.startLoop();
  }

  private startLoop() {
    if (this.loopHandle) return;
    const tick = async () => {
      if (this.running) return;
      this.running = true;
      try {
        const job = await this.prisma.job.findFirst({ where: { status: JobStatus.queued } });
        if (job) {
          await this.process(job.id);
        }
      } catch (e) {
        this.logger.error('Loop error', e as any);
      } finally {
        this.running = false;
        this.loopHandle = setTimeout(tick, 1000);
      }
    };
    this.loopHandle = setTimeout(tick, 200);
  }

  async enqueue(cvId: string, reportId: string, temperature = 0.2) {
    const job = await this.prisma.job.create({
      data: { cvId, reportId, temperature, status: JobStatus.queued }
    });
    return job;
  }

  async find(id: string) {
    return this.prisma.job.findUnique({ where: { id } });
  }

  private async process(id: string) {
    this.logger.log(`Processing job ${id}`);
    let job = await this.prisma.job.update({ where: { id }, data: { status: JobStatus.processing } });
    try {
      // Simulate long-running (1-2s)
      await new Promise(res => setTimeout(res, 1000 + Math.random() * 1000));
      const result = await this.pipeline.run(job.cvId, job.reportId, job.temperature);
      job = await this.prisma.job.update({ where: { id }, data: { status: JobStatus.completed, result } });
      this.logger.log(`Completed job ${id}`);
    } catch (e) {
      const retries = job.retries + 1;
      const max = Number(process.env.MAX_RETRIES ?? 3);
      const errMsg = (e as Error).message || 'unknown error';
      if (retries <= max) {
        await this.prisma.job.update({ where: { id }, data: { retries, status: JobStatus.queued, error: errMsg } });
        this.logger.warn(`Job ${id} failed attempt ${retries}, re-queued: ${errMsg}`);
      } else {
        await this.prisma.job.update({ where: { id }, data: { retries, status: JobStatus.failed, error: errMsg } });
        this.logger.error(`Job ${id} failed permanently: ${errMsg}`);
      }
    }
  }
}
