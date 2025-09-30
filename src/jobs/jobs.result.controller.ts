import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JobsService } from "./jobs.service";

@ApiTags("result")
@Controller("result")
export class JobsResultController {
  constructor(private readonly jobs: JobsService) {}

  @Get(":id")
  @ApiOperation({ summary: "Get evaluation job result" })
  @ApiParam({ name: "id", description: "Job ID", type: String })
  @ApiResponse({
    status: 200,
    description: "Job details (transformed result)",
  })
  @ApiResponse({ status: 404, description: "Job not found" })
  async get(@Param("id") id: string) {
    const job = await this.jobs.find(id);
    if (!job) return { error: "not found" };

    // For queued or processing, no result yet
    if (job.status === "queued" || job.status === "processing") {
      return { id: job.id, status: job.status };
    }

    if (job.status === "failed") {
      return { id: job.id, status: job.status, error: job.error };
    }

    // Transform final result when completed
    const raw = job.result as any;
    const transformed = raw
      ? {
          cv_match_rate: raw.cv?.weighted?.percentage
            ? raw.cv.weighted.percentage / 100
            : null,
          cv_feedback: raw.cv?.analysis || null,
          project_score: raw.project?.weighted?.weighted || null,
          project_feedback:
            raw.project?.feedback?.[0] || "No project feedback available",
          overall_summary: raw.overall?.summary?.join(" ") || null,
        }
      : null;

    return { id: job.id, status: job.status, result: transformed };
  }
}
