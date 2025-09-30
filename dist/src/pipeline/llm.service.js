"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LlmService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = require("openai");
const retry_1 = require("../common/utils/retry");
let LlmService = LlmService_1 = class LlmService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(LlmService_1.name);
        const apiKey = this.configService.get("OPENAI_API_KEY");
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY is required for LLM service");
        }
        this.openai = new openai_1.default({ apiKey });
        this.model = this.configService.get("LLM_MODEL") || "gpt-3.5-turbo";
        this.logger.log(`LLM Service initialized with model: ${this.model}`);
    }
    async extractFromCV(cvText) {
        return (0, retry_1.retryWithBackoff)(async () => {
            const truncatedText = cvText.substring(0, 2000);
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
                        content: "Extract CV data. Return valid JSON. Use empty arrays if missing.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.1,
                max_tokens: 500,
                response_format: { type: "json_object" },
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error("No response content from LLM");
            }
            try {
                const result = JSON.parse(content);
                this.logger.debug(`Extracted CV: ${result.skills.length} skills, ${result.years} years exp`);
                return result;
            }
            catch (parseError) {
                this.logger.error("Failed to parse LLM response:", content);
                throw new Error("Invalid JSON response from LLM");
            }
        });
    }
    async compareToJob(cv, jobContext) {
        return (0, retry_1.retryWithBackoff)(async () => {
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
                        content: "You are a technical recruiter. Analyze CV-job fit and identify skill overlaps. Return valid JSON.",
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
                return JSON.parse(content);
            }
            catch (parseError) {
                this.logger.error("Failed to parse comparison response:", content);
                throw new Error("Invalid JSON response from LLM");
            }
        });
    }
    async evaluateProject(reportText, rubricContext) {
        return (0, retry_1.retryWithBackoff)(async () => {
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
                        content: "You are a senior software engineer evaluating project quality. Be constructive and specific. Return valid JSON.",
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
                const result = JSON.parse(content);
                Object.values(result.scores).forEach((score) => {
                    if (score < 1 || score > 5) {
                        throw new Error(`Invalid score: ${score}. Must be between 1-5`);
                    }
                });
                return result;
            }
            catch (parseError) {
                this.logger.error("Failed to parse evaluation response:", content);
                throw new Error("Invalid JSON response from LLM");
            }
        });
    }
};
exports.LlmService = LlmService;
exports.LlmService = LlmService = LlmService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LlmService);
//# sourceMappingURL=llm.service.js.map