export type CVScores = {
  technicalMatch: number; // 1-5
  experience: number;     // 1-5
  achievements: number;   // 1-5
  culture: number;        // 1-5
};

export type ProjectScores = {
  correctness: number;    // 1-5
  codeQuality: number;    // 1-5
  resilience: number;     // 1-5
  documentation: number;  // 1-5
  creativity: number;     // 1-5
};

export function clamp15(n: number) { return Math.max(1, Math.min(5, Math.round(n))); }

export function aggregateCV(scores: CVScores) {
  // Weights per PDF spec (approx.)
  const w = { technicalMatch: 0.4, experience: 0.25, achievements: 0.2, culture: 0.15 };
  const avg = scores.technicalMatch*w.technicalMatch + scores.experience*w.experience + scores.achievements*w.achievements + scores.culture*w.culture;
  return { weighted: avg, percentage: avg * 20 }; // 1-5 => 20-100%
}

export function aggregateProject(scores: ProjectScores) {
  const w = { correctness: 0.3, codeQuality: 0.25, resilience: 0.2, documentation: 0.15, creativity: 0.1 };
  const avg = scores.correctness*w.correctness + scores.codeQuality*w.codeQuality + scores.resilience*w.resilience + scores.documentation*w.documentation + scores.creativity*w.creativity;
  return { weighted: avg };
}
