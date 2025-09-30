import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PipelineService } from '@/pipeline/pipeline.service';
export declare class JobsService implements OnModuleInit {
    private prisma;
    private pipeline;
    private readonly logger;
    private loopHandle;
    private running;
    constructor(prisma: PrismaService, pipeline: PipelineService);
    onModuleInit(): Promise<void>;
    private startLoop;
    enqueue(cvId: string, reportId: string, temperature?: number): Promise<{
        error: string | null;
        id: string;
        createdAt: Date;
        result: import("@prisma/client/runtime/library").JsonValue | null;
        status: import(".prisma/client").$Enums.JobStatus;
        retries: number;
        temperature: number;
        updatedAt: Date;
        cvId: string;
        reportId: string;
    }>;
    find(id: string): Promise<{
        error: string | null;
        id: string;
        createdAt: Date;
        result: import("@prisma/client/runtime/library").JsonValue | null;
        status: import(".prisma/client").$Enums.JobStatus;
        retries: number;
        temperature: number;
        updatedAt: Date;
        cvId: string;
        reportId: string;
    } | null>;
    private process;
}
