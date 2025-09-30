import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { PipelineModule } from '@/pipeline/pipeline.module';
import { JobsResultController } from './jobs.result.controller';

@Module({
  imports: [PrismaModule, PipelineModule],
  controllers: [JobsController,JobsResultController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
