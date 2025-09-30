import { Injectable } from '@nestjs/common';
import { FilesService } from '@/files/files.service';
import { RagService } from './rag.service';
import { LlmService } from './llm.service';
import { clamp15, aggregateCV, aggregateProject, CVScores, ProjectScores } from './scoring';

@Injectable()
export class PipelineService {
  constructor(
    private files: FilesService,
    private rag: RagService,
    private llm: LlmService,
  ) {}

  async run(cvId: string, reportId: string, temperature = 0.2) {
    // 1) Load texts
    const [cvText, reportText] = await Promise.all([
      this.files.getUploadText(cvId),
      this.files.getUploadText(reportId),
    ]);

    // 2) RAG retrieve job desc + rubric contexts
    const [jobCtx] = await this.rag.retrieve('backend product engineer job description');
    const [rubricCtx] = await this.rag.retrieve('scoring rubric for CV and project');

    // 3) Extract CV & compare
    const extracted = await this.llm.extractFromCV(cvText || '');
    const { analysis, skillOverlap } = await this.llm.compareToJob(extracted, jobCtx?.content || '');

    // 4) Heuristic CV scoring
    const techMatch = clamp15(Math.max(1, Math.min(5, 2 + Math.round(skillOverlap.length / 2))));
    const exp = clamp15(extracted.years >= 5 ? 5 : extracted.years >= 3 ? 4 : extracted.years >= 2 ? 3 : extracted.years >= 1 ? 2 : 1);
    const ach = clamp15((extracted.achievements?.length || 0) >= 3 ? 4 : (extracted.achievements?.length || 0) >= 1 ? 3 : 2);
    const culture = clamp15((extracted.softSkills?.length || 0) >= 3 ? 4 : (extracted.softSkills?.length || 0) >= 1 ? 3 : 2);
    const cvScores: CVScores = { technicalMatch: techMatch, experience: exp, achievements: ach, culture };

    const cvAgg = aggregateCV(cvScores);

    // 5) Evaluate project deliverable
    const projEval = await this.llm.evaluateProject(reportText || '', rubricCtx?.content || '');
    const projScores: ProjectScores = {
      correctness: projEval.scores.correctness,
      codeQuality: projEval.scores.codeQuality,
      resilience: projEval.scores.resilience,
      documentation: projEval.scores.documentation,
      creativity: projEval.scores.creativity,
    };
    const projAgg = aggregateProject(projScores);

    // 6) Overall summary
    const summary = [
      `CV match is ${cvAgg.percentage.toFixed(1)}%. Strong overlaps: ${skillOverlap.slice(0,5).join(', ') || 'none obvious'}.`,
      `Project scoring indicates correctness=${projScores.correctness}, quality=${projScores.codeQuality}, resilience=${projScores.resilience}.`,
      ...(projEval.feedback.slice(0,2)),
      `Recommendation: focus on ${skillOverlap.length < 3 ? 'strengthening core backend & AI integration' : 'depth and testing'} in the short term.`
    ];

    return {
      cv: {
        extracted,
        scores: cvScores,
        weighted: cvAgg,
        analysis,
      },
      project: {
        scores: projScores,
        weighted: projAgg,
        feedback: projEval.feedback,
      },
      overall: {
        summary,
      }
    };
  }
}
