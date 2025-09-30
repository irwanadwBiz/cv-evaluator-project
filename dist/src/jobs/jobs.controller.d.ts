import { JobsService } from "./jobs.service";
export declare class CreateJobDto {
    cvId: string;
    reportId: string;
    temperature?: number;
}
export declare class JobResponseDto {
    cv?: {
        weighted?: {
            percentage?: number;
        };
        analysis?: string;
    };
    project?: {
        weighted?: {
            weighted?: number;
        };
        feedback?: string[];
    };
    overall?: {
        summary?: string[];
    };
}
export declare class JobsController {
    private jobs;
    constructor(jobs: JobsService);
    create(body: CreateJobDto): Promise<{
        error: string;
        jobId?: undefined;
        status?: undefined;
    } | {
        jobId: string;
        status: import(".prisma/client").$Enums.JobStatus;
        error?: undefined;
    }>;
}
