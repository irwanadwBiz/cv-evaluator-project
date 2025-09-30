import { FilesService } from "./files.service";
import { UploadType } from "@prisma/client";
export declare class FilesController {
    private files;
    constructor(files: FilesService);
    upload(file: Express.Multer.File, type: UploadType): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.UploadType;
        name: string;
    }>;
}
