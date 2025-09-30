import { FilesService } from '@/files/files.service';
import { RagService } from './rag.service';
import { LlmService } from './llm.service';
import { CVScores, ProjectScores } from './scoring';
export declare class PipelineService {
    private files;
    private rag;
    private llm;
    constructor(files: FilesService, rag: RagService, llm: LlmService);
    run(cvId: string, reportId: string, temperature?: number): Promise<{
        cv: {
            extracted: {
                skills: string[];
                years: number;
                projects: string[];
                achievements: string[];
                softSkills: string[];
            };
            scores: CVScores;
            weighted: {
                weighted: number;
                percentage: number;
            };
            analysis: string;
        };
        project: {
            scores: ProjectScores;
            weighted: {
                weighted: number;
            };
            feedback: string[];
        };
        overall: {
            summary: string[];
        };
    }>;
}
