# CV Evaluator Project – Backend (NestJS)

Asynchronous evaluation pipeline with file uploads (CV & Project Report), RAG over a simple vector store, mock LLM with retries/backoff, and status polling.

## Features (per spec)
- Upload CV & project report (`.txt`, `.pdf`, `.docx`) via `POST /files/upload`.
- Start evaluation job (async) via `POST /evaluate` returning a `jobId`.
- Poll job status via `GET /evaluate/:id` with states: `queued | processing | completed | failed`.
- AI pipeline:
  - Extract structured info from CV (skills, years, projects).
  - Compare with job description (via RAG retrieve).
  - Score CV and evaluate project deliverable against a rubric.
  - Aggregate weighted scores and generate a short summary.
- RAG: tiny vector DB in Prisma (`VectorDoc`) with deterministic hashed-bag embeddings.
- Long-running job orchestration: in-process queue loop with retries & exponential backoff.
- Error simulation: configurable `FAIL_RATE` to randomly fail LLM calls to test resilience.

## Tech
- Node 20+, NestJS 10, Prisma (SQLite), Multer, optional OpenAI client (not required; defaults to mock).

## Quick Start
```bash
npm i
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run start:dev
```
Server runs on `http://localhost:3000`.

Create uploads dir automatically on boot.

## API Documentation
http://{URI}/api-docs

### Environment
Copy `.env.example` to `.env` and adjust as needed.
- `DATABASE_URL` defaults to SQLite file.
- `FAIL_RATE`, `MAX_RETRIES`, `BASE_BACKOFF_MS`, `TEMPERATURE` tune pipeline behavior.
- `OPENAI_API_KEY` (optional): if provided, you can wire your own provider; mock LLM is default.

## API

### 1) Upload
`POST /files/upload` (multipart/form-data)
- fields: `file` (binary), `type` = `CV` or `REPORT`
- response: `{ id, type, name }`

### 2) Evaluate (async)
`POST /evaluate` JSON:
```json
{ "cvId": "<upload-id>", "reportId": "<upload-id>", "temperature": 0.2 }
```
Response `202 Accepted`:
```json
{ "jobId": "<job-id>", "status": "queued" }
```

### 3) Check Status / Result
`GET /evaluate/:id`:
```json
{
  "id": "...",
  "status": "completed",
  "retries": 1,
  "error": null,
  "result": {
    "cv": { "extracted": { ... }, "scores": { ... }, "weighted": { "percentage": 84 }, "analysis": "..." },
    "project": { "scores": { ... }, "weighted": { ... }, "feedback": ["..."] },
    "overall": { "summary": ["...", "..."] }
  }
}
```
Status values: `queued | processing | completed | failed`.

## Notes
- Vector store is seeded with concise summaries of the job description & rubric; see `prisma/seed.ts`.
- For PDFs & DOCX, basic extraction is provided via `pdf-parse` and `docx-parser` (best-effort). For reliable scoring, prefer text uploads when testing.
- The LLM service uses a deterministic mock with optional random failure and supports retries with exponential backoff.
- CORS enabled; set `CORS_ORIGINS` in `.env` if needed.

## Tests
You can add Jest tests in `tests/` for the scoring helpers and pipeline. (Skeleton left minimal for brevity.)

## Why these choices?
- **Simplicity**: SQLite + Prisma keeps setup tiny yet realistic.
- **Determinism**: Hashed-bag embeddings and mock LLM make the pipeline fully offline and repeatable.
- **Resilience**: Retries/backoff, stateful jobs, and explicit status endpoints model real async LLM flows.
- **Extensibility**: Swap `LlmService` internals to call OpenAI/Gemini; drop-in Redis/BullMQ if needed.

## License
MIT
