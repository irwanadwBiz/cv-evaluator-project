"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmService = void 0;
const common_1 = require("@nestjs/common");
const retry_1 = require("../common/utils/retry");
let LlmService = class LlmService {
    constructor() {
        this.failRate = Number(process.env.FAIL_RATE ?? 0.15);
        this.temperature = Number(process.env.TEMPERATURE ?? 0.2);
    }
    maybeFail() {
        if (Math.random() < this.failRate) {
            const err = new Error('TransientLLMError: simulated rate limit / timeout');
            err.transient = true;
            throw err;
        }
    }
    async extractFromCV(cvText) {
        return (0, retry_1.retryWithBackoff)(async () => {
            this.maybeFail();
            const lower = (cvText || '').toLowerCase();
            const skills = Array.from(new Set((lower.match(/(node|nest|express|prisma|postgres|mysql|redis|docker|aws|gcp|k8s|python|java|golang|ai|llm|rag|prompt|rest|graphql)/g) || [])));
            const projects = Array.from(new Set((lower.match(/project\s+[a-z0-9\-\_]+|built\s+[a-z]+|service\s+[a-z]+/g) || []))).slice(0, 6);
            const soft = Array.from(new Set((lower.match(/communication|teamwork|leadership|learning|ownership|collaboration|manager of one/g) || [])));
            const years = (lower.match(/(\d+)\+?\s*(years|yrs)/) || [0, '0'])[1];
            const achievements = Array.from(new Set((lower.match(/(improved|reduced|increased|scaled|optimized|migrated)/g) || [])));
            return {
                skills,
                years: Number(years || 0),
                projects,
                achievements,
                softSkills: soft,
            };
        });
    }
    async compareToJob(cv, jobCtx) {
        return (0, retry_1.retryWithBackoff)(async () => {
            this.maybeFail();
            const required = Array.from(new Set(jobCtx.toLowerCase().match(/node|nestjs|python|rails|django|postgres|mysql|redis|ai|llm|rag|prompt|retry|queue|cloud|aws|gcp|docker|k8s|testing/g) || []));
            const overlap = cv.skills.filter(s => required.includes(s));
            const analysis = `Technical overlap: ${overlap.length} / ${required.length}. Candidate skills: ${cv.skills.join(', ')}.`;
            return { analysis, skillOverlap: overlap };
        });
    }
    async evaluateProject(reportText, rubricCtx) {
        return (0, retry_1.retryWithBackoff)(async () => {
            this.maybeFail();
            const t = (reportText || '').toLowerCase();
            const hasPrompt = /prompt/.test(t);
            const hasChain = /chain|chaining/.test(t);
            const hasRag = /rag|retrieval/.test(t);
            const hasRetry = /retry|backoff|fail|timeout/.test(t);
            const hasDocs = /readme|docs|documentation/.test(t);
            const hasTests = /test|jest/.test(t);
            const creativity = /auth|dashboard|deploy|docker|monitoring/.test(t);
            const clamped = (b, base) => b ? base : Math.max(1, base - 2);
            const scores = {
                correctness: clamped(hasPrompt && hasChain && hasRag, 5),
                codeQuality: clamped(hasTests, 4),
                resilience: clamped(hasRetry, 4),
                documentation: clamped(hasDocs, 4),
                creativity: clamped(creativity, 3),
            };
            const fb = [];
            if (!hasRag)
                fb.push('Consider adding RAG with a small vector store.');
            if (!hasRetry)
                fb.push('Add retry/backoff for transient LLM failures.');
            if (!hasDocs)
                fb.push('Strengthen the README with setup & design choices.');
            if (!hasTests)
                fb.push('Include unit tests for scoring and services.');
            return { scores, feedback: fb };
        });
    }
};
exports.LlmService = LlmService;
exports.LlmService = LlmService = __decorate([
    (0, common_1.Injectable)()
], LlmService);
//# sourceMappingURL=llm.service.js.map