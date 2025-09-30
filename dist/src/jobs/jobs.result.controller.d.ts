import { JobsService } from "./jobs.service";
export declare class JobsResultController {
    private readonly jobs;
    constructor(jobs: JobsService);
    get(id: string): Promise<{
        error: string;
        id?: undefined;
        status?: undefined;
        result?: undefined;
    } | {
        id: string;
        status: "queued" | "processing";
        error?: undefined;
        result?: undefined;
    } | {
        id: string;
        status: "failed";
        error: string | null;
        result?: undefined;
    } | {
        id: string;
        status: "completed";
        result: {
            cv_match_rate: number | null;
            cv_feedback: any;
            project_score: any;
            project_feedback: any;
            overall_summary: any;
        } | null;
        error?: undefined;
    }>;
}
