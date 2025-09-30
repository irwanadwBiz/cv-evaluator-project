import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { FilesService } from "./files.service";
import { UploadType } from "@prisma/client";
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";

@ApiTags("files")
@Controller("files")
export class FilesController {
  constructor(private files: FilesService) {}

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    })
  )
  @ApiOperation({ summary: "Upload a file (CV, REPORT, OTHER)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Upload file with type",
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
        type: {
          type: "string",
          enum: ["CV", "REPORT", "OTHER"],
        },
      },
      required: ["file", "type"],
    },
  })
  @ApiResponse({ status: 201, description: "File uploaded successfully" })
  @ApiResponse({ status: 400, description: "Validation failed" })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body("type") type: UploadType
  ) {
    if (!file) throw new BadRequestException("file is required");
    if (!type || !["CV", "REPORT", "OTHER"].includes(type))
      throw new BadRequestException("type must be CV or REPORT or OTHER");

    const rec = await this.files.saveUpload(file, type);
    return { id: rec.id, type: rec.type, name: rec.originalName };
  }
}
