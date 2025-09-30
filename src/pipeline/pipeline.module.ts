import { Module } from "@nestjs/common";
import { PipelineService } from "./pipeline.service";
import { RagService } from "./rag.service";
import { LlmService } from "./llm.service";
import { PrismaModule } from "@/prisma/prisma.module";
import { FilesModule } from "@/files/files.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [PrismaModule, FilesModule, ConfigModule],
  providers: [PipelineService, RagService, LlmService],
  exports: [PipelineService],
})
export class PipelineModule {}
