import { PrismaService } from '@/prisma/prisma.service';
export declare class RagService {
    private prisma;
    constructor(prisma: PrismaService);
    retrieve(query: string, topK?: number): Promise<{
        kind: string;
        title: string;
        content: string;
        score: number;
    }[]>;
}
