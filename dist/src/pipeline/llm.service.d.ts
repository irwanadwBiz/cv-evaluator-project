import { ConfigService } from "@nestjs/config";
type ExtractedCV = {
    skills: string[];
    years: number;
    projects: string[];
    achievements: string[];
    softSkills: string[];
};
export declare class LlmService {
    private configService;
    private readonly logger;
    private openai;
    private model;
    constructor(configService: ConfigService);
    extractFromCV(cvText: string): Promise<ExtractedCV>;
    compareToJob(cv: ExtractedCV, jobContext: string): Promise<{
        analysis: string;
        skillOverlap: string[];
    }>;
    evaluateProject(reportText: string, rubricContext: string): Promise<{
        scores: Record<string, number>;
        feedback: string[];
    }>;
}
export {};
