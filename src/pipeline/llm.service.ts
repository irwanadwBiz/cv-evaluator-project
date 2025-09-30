import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { retryWithBackoff } from "@/common/utils/retry";

type ExtractedCV = {
  skills: string[];
  years: number;
  projects: string[];
  achievements: string[];
  softSkills: string[];
};

@Injectable()
export class LlmService {
  private cvCache = new Map<string, ExtractedCV>();

  private readonly logger = new Logger(LlmService.name);
  private openai: OpenAI;
  private model: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required for LLM service");
    }
    this.openai = new OpenAI({ apiKey });
    this.model = this.configService.get<string>("LLM_MODEL") || "gpt-3.5-turbo";
    this.logger.log(`LLM Service initialized with model: ${this.model}`);
  }

  async extractFromCV(cvText: string): Promise<ExtractedCV> {
    const hash = require("crypto")
      .createHash("md5")
      .update(cvText)
      .digest("hex");
    const cacheKey = `cv_${hash}`;

    if (this.cvCache.has(cacheKey)) {
      this.logger.log("📦 Using cached CV extraction");
      return this.cvCache.get(cacheKey)!;
    }

    return retryWithBackoff(async () => {
      const truncatedText = cvText.substring(0, 2000); // Dari 8000 jadi 2000
      const prompt = `
Extract from CV:

${truncatedText}

Return JSON:
{
  "skills": ["tech", "skills"],
  "years": number,
  "projects": ["project names"],
  "achievements": ["key achievements"], 
  "softSkills": ["soft skills"]
}

Rules:
- Skills: programming languages, frameworks, tools
- Years: total professional experience as number
- Projects: max 4 project names
- Achievements: measurable results only
- SoftSkills: personal attributes
`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            // ✅ OPTIMIZED: Prompt lebih pendek
            content:
              "Extract CV data. Return valid JSON. Use empty arrays if missing.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 500, // ✅ OPTIMIZED: Dari 1000 jadi 500
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response content from LLM");
      }

      try {
        const result = JSON.parse(content) as ExtractedCV;
        this.cvCache.set(cacheKey, result);
        return result;
      } catch (parseError) {
        this.logger.error("Failed to parse LLM response:", content);
        throw new Error("Invalid JSON response from LLM");
      }
    });
  }

  async compareToJob(
    cv: ExtractedCV,
    jobContext: string
  ): Promise<{ analysis: string; skillOverlap: string[] }> {
    return retryWithBackoff(async () => {
      const prompt = `
Compare the candidate's profile with job requirements and provide analysis.

CANDIDATE PROFILE:
- Skills: ${cv.skills.join(", ")}
- Experience: ${cv.years} years
- Key Projects: ${cv.projects.slice(0, 3).join(", ")}
- Achievements: ${cv.achievements.slice(0, 3).join(", ")}
- Soft Skills: ${cv.softSkills.join(", ")}

JOB REQUIREMENTS/CONTEXT:
${jobContext}

Provide:
1. Brief analysis of fit (strengths, gaps)
2. List of specific overlapping technical skills

Return ONLY JSON:
{
  "analysis": "string with analysis",
  "skillOverlap": ["skill1", "skill2"]
}
`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a technical recruiter. Analyze CV-job fit and identify skill overlaps. Return valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 500,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response content from LLM");
      }

      try {
        return JSON.parse(content) as {
          analysis: string;
          skillOverlap: string[];
        };
      } catch (parseError) {
        this.logger.error("Failed to parse comparison response:", content);
        throw new Error("Invalid JSON response from LLM");
      }
    });
  }

  async evaluateProject(
    reportText: string,
    rubricContext: string
  ): Promise<{ scores: Record<string, number>; feedback: string[] }> {
    return retryWithBackoff(async () => {
      const prompt = `
Evaluate the project report based on the scoring rubric.

PROJECT REPORT:
${reportText.substring(0, 6000)}

RUBRIC CONTEXT:
${rubricContext}

Evaluate on these criteria (1-5 scale):
- Correctness: Implementation accuracy, prompt design, LLM chaining
- Code Quality: Structure, modularity, testing
- Resilience: Error handling, retries, fault tolerance  
- Documentation: README, explanations, setup instructions
- Creativity: Extra features, innovation beyond requirements

Provide:
1. Scores for each criterion (1-5)
2. Constructive feedback suggestions

Return ONLY JSON:
{
  "scores": {
    "correctness": number,
    "codeQuality": number, 
    "resilience": number,
    "documentation": number,
    "creativity": number
  },
  "feedback": ["suggestion1", "suggestion2"]
}
`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a senior software engineer evaluating project quality. Be constructive and specific. Return valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response content from LLM");
      }

      try {
        const result = JSON.parse(content) as {
          scores: Record<string, number>;
          feedback: string[];
        };

        // Validate scores are between 1-5
        Object.values(result.scores).forEach((score) => {
          if (score < 1 || score > 5) {
            throw new Error(`Invalid score: ${score}. Must be between 1-5`);
          }
        });

        return result;
      } catch (parseError) {
        this.logger.error("Failed to parse evaluation response:", content);
        throw new Error("Invalid JSON response from LLM");
      }
    });
  }
}

// import { Injectable } from '@nestjs/common';
// import { retryWithBackoff } from '@/common/utils/retry';

// type ExtractedCV = {
//   skills: string[];
//   years: number;
//   projects: string[];
//   achievements: string[];
//   softSkills: string[];
// };

// @Injectable()
// export class LlmService {
//   private failRate = Number(process.env.FAIL_RATE ?? 0.15);
//   private temperature = Number(process.env.TEMPERATURE ?? 0.2);

//   private maybeFail() {
//     if (Math.random() < this.failRate) {
//       const err = new Error('TransientLLMError: simulated rate limit / timeout');
//       (err as any).transient = true;
//       throw err;
//     }
//   }

//   async extractFromCV(cvText: string): Promise<ExtractedCV> {
//     return retryWithBackoff(async () => {
//       this.maybeFail();
//       // Deterministic mock extraction
//       const lower = (cvText || '').toLowerCase();
//       const skills = Array.from(new Set((lower.match(/(node|nest|express|prisma|postgres|mysql|redis|docker|aws|gcp|k8s|python|java|golang|ai|llm|rag|prompt|rest|graphql)/g) || [])));
//       const projects = Array.from(new Set((lower.match(/project\s+[a-z0-9\-\_]+|built\s+[a-z]+|service\s+[a-z]+/g) || []))).slice(0, 6);
//       const soft = Array.from(new Set((lower.match(/communication|teamwork|leadership|learning|ownership|collaboration|manager of one/g) || [])));
//       const years = (lower.match(/(\d+)\+?\s*(years|yrs)/) || [0, '0'])[1];
//       const achievements = Array.from(new Set((lower.match(/(improved|reduced|increased|scaled|optimized|migrated)/g) || [])));
//       return {
//         skills,
//         years: Number(years || 0),
//         projects,
//         achievements,
//         softSkills: soft,
//       };
//     });
//   }

//   async compareToJob(cv: ExtractedCV, jobCtx: string): Promise<{analysis: string, skillOverlap: string[]}> {
//     return retryWithBackoff(async () => {
//       this.maybeFail();
//       const required = Array.from(new Set(jobCtx.toLowerCase().match(/node|nestjs|python|rails|django|postgres|mysql|redis|ai|llm|rag|prompt|retry|queue|cloud|aws|gcp|docker|k8s|testing/g) || []));
//       const overlap = cv.skills.filter(s => required.includes(s));
//       const analysis = `Technical overlap: ${overlap.length} / ${required.length}. Candidate skills: ${cv.skills.join(', ')}.`;
//       return { analysis, skillOverlap: overlap };
//     });
//   }

//   async evaluateProject(reportText: string, rubricCtx: string): Promise<{ scores: Record<string, number>, feedback: string[] }> {
//     return retryWithBackoff(async () => {
//       this.maybeFail();
//       const t = (reportText || '').toLowerCase();
//       const hasPrompt = /prompt/.test(t);
//       const hasChain = /chain|chaining/.test(t);
//       const hasRag = /rag|retrieval/.test(t);
//       const hasRetry = /retry|backoff|fail|timeout/.test(t);
//       const hasDocs = /readme|docs|documentation/.test(t);
//       const hasTests = /test|jest/.test(t);
//       const creativity = /auth|dashboard|deploy|docker|monitoring/.test(t);

//       const clamped = (b: boolean, base: number) => b ? base : Math.max(1, base-2);
//       const scores = {
//         correctness: clamped(hasPrompt && hasChain && hasRag, 5),
//         codeQuality: clamped(hasTests, 4),
//         resilience: clamped(hasRetry, 4),
//         documentation: clamped(hasDocs, 4),
//         creativity: clamped(creativity, 3),
//       };
//       const fb: string[] = [];
//       if (!hasRag) fb.push('Consider adding RAG with a small vector store.');
//       if (!hasRetry) fb.push('Add retry/backoff for transient LLM failures.');
//       if (!hasDocs) fb.push('Strengthen the README with setup & design choices.');
//       if (!hasTests) fb.push('Include unit tests for scoring and services.');
//       return { scores, feedback: fb };
//     });
//   }
// }
