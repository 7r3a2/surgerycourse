import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma_v2: PrismaClient | undefined;
};

// Vercel Postgres provide several env vars. DATABASE_URL is standard but might be missing.
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;

export const prisma =
    globalForPrisma.prisma_v2 ??
    new PrismaClient({
        datasources: databaseUrl ? {
            db: {
                url: databaseUrl
            }
        } : undefined,
        log: ['error', 'warn'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v2 = prisma;
