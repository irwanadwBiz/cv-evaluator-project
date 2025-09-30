import { PrismaService } from '@/prisma/prisma.service';
import { UploadType } from '@prisma/client';
export declare class FilesService {
    private prisma;
    constructor(prisma: PrismaService);
    saveUpload(file: Express.Multer.File, type: UploadType): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.UploadType;
        originalName: string;
        mimeType: string;
        path: string;
        size: number;
        text: string | null;
        createdAt: Date;
    }>;
    getUploadText(id: string): Promise<string>;
    private extractText;
}
