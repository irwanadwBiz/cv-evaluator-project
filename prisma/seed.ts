import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// A small, paraphrased summary of the job description & rubric (avoid long verbatim text).
const JOB_DESC = `Backend engineer role: build robust REST APIs, integrate LLM features (prompt design, chains, RAG),
handle long-running jobs with retries, and write clean, maintainable code. Prefer experience with databases,
security, scalability, testing, and cloud basics. Indonesia time zone.`;

const RUBRIC = `CV scoring dimensions: technical skills match, experience level, achievements impact, collaboration fit.
Project scoring: correctness of prompt+chaining+RAG, code quality, resilience/error handling, documentation,
and creativity. Each 1-5 with weights. Produce overall summary and recommendations.`;

function hashEmbedding(text: string, dim = 256): number[] {
  // Very simple hashed bag embedding (deterministic, no external models)
  const vec = new Array(dim).fill(0);
  const toks = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  for (const t of toks) {
    let h = 2166136261;
    for (let i = 0; i < t.length; i++) {
      h ^= t.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
      h = h >>> 0;
    }
    const idx = h % dim;
    vec[idx] += 1;
  }
  // L2 normalize
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map(v => v / norm);
}

async function main() {
  const count = await prisma.vectorDoc.count();
  if (count > 0) {
    console.log('Vector docs already seeded.');
    return;
  }
  await prisma.vectorDoc.createMany({
    data: [
      {
        kind: 'job',
        title: 'Backend Product Engineer (summary)',
        content: JOB_DESC,
        embedding: hashEmbedding(JOB_DESC)
      },
      {
        kind: 'rubric',
        title: 'Scoring rubric (summary)',
        content: RUBRIC,
        embedding: hashEmbedding(RUBRIC)
      }
    ]
  });
  console.log('Seeded vector docs.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
