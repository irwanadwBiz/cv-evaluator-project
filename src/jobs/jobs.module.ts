import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { JobsController } from "./jobs.controller";
import { PrismaModule } from "@/prisma/prisma.module";
import { PipelineModule } from "@/pipeline/pipeline.module";
import { JobsResultController } from "./jobs.result.controller";
import { RagService } from "@/pipeline/rag.service";

@Module({
  imports: [PrismaModule, PipelineModule],
  controllers: [JobsController, JobsResultController],
  providers: [JobsService, RagService],
  exports: [JobsService],
})
export class JobsModule {}
