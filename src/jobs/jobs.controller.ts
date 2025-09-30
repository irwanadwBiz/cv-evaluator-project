import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
import { JobsService } from "./jobs.service";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiProperty,
} from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

// DTOs for Swagger and validation
export class CreateJobDto {
  @ApiProperty({
    description: "ID of the uploaded CV file",
    example: "cmg51y1f000002zzoa5c3k1yq",
  })
  @IsString()
  cvId!: string;

  @ApiProperty({
    description: "ID of the uploaded Project Report file",
    example: "cmg522pdf00012zzogmqny9bp",
  })
  @IsString()
  reportId!: string;

  @ApiProperty({
    description: "Optional temperature parameter for evaluation",
    example: 0.7,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  temperature?: number;
}

export class JobResponseDto {
  cv?: {
    weighted?: { percentage?: number };
    analysis?: string;
  };
  project?: {
    weighted?: { weighted?: number };
    feedback?: string[];
  };
  overall?: {
    summary?: string[];
  };
}

@ApiTags("evaluate")
@Controller("evaluate")
export class JobsController {
  constructor(private jobs: JobsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: "Create a new evaluation job" })
  @ApiBody({ type: CreateJobDto })
  @ApiResponse({
    status: 202,
    description: "Job accepted for processing",
    schema: {
      example: { jobId: "abc123", status: "queued" },
    },
  })
  @ApiResponse({ status: 400, description: "Missing cvId or reportId" })
  async create(@Body() body: CreateJobDto) {
    const { cvId, reportId, temperature } = body || {};
    if (!cvId || !reportId) {
      return { error: "cvId and reportId are required" };
    }
    const job = await this.jobs.enqueue(
      cvId,
      reportId,
      temperature ?? Number(process.env.TEMPERATURE ?? 0.2)
    );
    return { jobId: job.id, status: job.status };
  }

  // @Get(":id")
  // @ApiOperation({ summary: "Get evaluation job status" })
  // @ApiParam({ name: "id", description: "Job ID", type: String })
  // @ApiResponse({
  //   status: 200,
  //   description: "Job details",
  //   type: JobResponseDto,
  // })
  // @ApiResponse({ status: 404, description: "Job not found" })
  // async get(@Param("id") id: string) {
  //   const job = await this.jobs.find(id);
  //   if (!job) return { error: "not found" };
  //   return {
  //     id: job.id,
  //     status: job.status,
  //     retries: job.retries,
  //     error: job.error,
  //     result: job.result || null,
  //   };
  // }

  // @Get(":id")
  // @ApiOperation({ summary: "Get evaluation job status" })
  // @ApiParam({ name: "id", description: "Job ID", type: String })
  // @ApiResponse({
  //   status: 200,
  //   description: "Job details (transformed result)",
  // })
  // @ApiResponse({ status: 404, description: "Job not found" })
  // async get(@Param("id") id: string) {
  //   const job = await this.jobs.find(id);
  //   if (!job) return { error: "not found" };

  //   // Cast Prisma JSON to our shape
  //   const raw = job.result as unknown as JobResponseDto;

  //   const transformed = raw
  //     ? {
  //       cv_match_rate: raw.cv?.weighted?.percentage
  //         ? raw.cv.weighted.percentage / 100
  //         : null,
  //       cv_feedback: raw.cv?.analysis || null,
  //       project_score: raw.project?.weighted?.weighted || null,
  //       project_feedback:
  //         raw.project?.feedback?.[0] || "No project feedback available",
  //       overall_summary: raw.overall?.summary?.join(" ") || null,
  //     }
  //     : null;

  //   return {
  //     id: job.id,
  //     status: job.status,
  //     result: transformed,
  //   };
  // }
}
