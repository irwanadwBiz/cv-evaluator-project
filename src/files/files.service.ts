import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UploadType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const pdfParse = require('pdf-parse');
let mammoth: any;
try {
  mammoth = require('mammoth');
} catch {
  // optional
}

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async saveUpload(file: Express.Multer.File, type: UploadType) {
    const text = await this.extractText(file);
    const rec = await this.prisma.upload.create({
      data: {
        type,
        originalName: file.originalname,
        mimeType: file.mimetype,
        path: file.path,
        size: file.size,
        text,
      },
    });
    return rec;
  }

  async getUploadText(id: string): Promise<string> {
    const rec = await this.prisma.upload.findUnique({ where: { id } });
    return rec?.text ?? '';
  }

  private async extractText(file: Express.Multer.File): Promise<string | null> {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.txt') {
      return fs.readFileSync(file.path, 'utf8');
    }
    if (ext === '.pdf') {
      try {
        const data = await pdfParse(fs.readFileSync(file.path));
        return data.text || null;
      } catch {
        return null;
      }
    }
    if (ext === '.docx' && mammoth) {
      try {
        const result = await mammoth.extractRawText({ path: file.path });
        return (result && result.value) ? result.value : null;
      } catch {
        return null;
      }
    }
    // fallback for other mimetypes
    try {
      return fs.readFileSync(file.path, 'utf8');
    } catch {
      return null;
    }
  }
}
