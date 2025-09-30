type ExtractedCV = {
    skills: string[];
    years: number;
    projects: string[];
    achievements: string[];
    softSkills: string[];
};
export declare class LlmService {
    private failRate;
    private temperature;
    private maybeFail;
    extractFromCV(cvText: string): Promise<ExtractedCV>;
    compareToJob(cv: ExtractedCV, jobCtx: string): Promise<{
        analysis: string;
        skillOverlap: string[];
    }>;
    evaluateProject(reportText: string, rubricCtx: string): Promise<{
        scores: Record<string, number>;
        feedback: string[];
    }>;
}
export {};
