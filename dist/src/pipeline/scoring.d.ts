export type CVScores = {
    technicalMatch: number;
    experience: number;
    achievements: number;
    culture: number;
};
export type ProjectScores = {
    correctness: number;
    codeQuality: number;
    resilience: number;
    documentation: number;
    creativity: number;
};
export declare function clamp15(n: number): number;
export declare function aggregateCV(scores: CVScores): {
    weighted: number;
    percentage: number;
};
export declare function aggregateProject(scores: ProjectScores): {
    weighted: number;
};
