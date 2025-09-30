"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp15 = clamp15;
exports.aggregateCV = aggregateCV;
exports.aggregateProject = aggregateProject;
function clamp15(n) { return Math.max(1, Math.min(5, Math.round(n))); }
function aggregateCV(scores) {
    const w = { technicalMatch: 0.4, experience: 0.25, achievements: 0.2, culture: 0.15 };
    const avg = scores.technicalMatch * w.technicalMatch + scores.experience * w.experience + scores.achievements * w.achievements + scores.culture * w.culture;
    return { weighted: avg, percentage: avg * 20 };
}
function aggregateProject(scores) {
    const w = { correctness: 0.3, codeQuality: 0.25, resilience: 0.2, documentation: 0.15, creativity: 0.1 };
    const avg = scores.correctness * w.correctness + scores.codeQuality * w.codeQuality + scores.resilience * w.resilience + scores.documentation * w.documentation + scores.creativity * w.creativity;
    return { weighted: avg };
}
//# sourceMappingURL=scoring.js.map