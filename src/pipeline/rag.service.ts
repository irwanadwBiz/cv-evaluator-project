import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

function cosine(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / ((Math.sqrt(na) || 1) * (Math.sqrt(nb) || 1));
}

function hashEmbedding(text: string, dim = 256): number[] {
  const vec = new Array(dim).fill(0);
  const toks = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
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
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

@Injectable()
export class RagService {
  constructor(private prisma: PrismaService) {}

  async retrieve(query: string, topK = 2) {
    const q = hashEmbedding(query);
    const docs = await this.prisma.vectorDoc.findMany();
    const scored = docs.map((d) => ({
      doc: d,
      score: cosine(q, (d.embedding as number[]) || []),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((s) => ({
      kind: s.doc.kind,
      title: s.doc.title,
      content: s.doc.content,
      score: s.score,
    }));
  }
}
