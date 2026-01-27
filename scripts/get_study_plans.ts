import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // Read JSON from stdin for args
        let data = '';
        for await (const chunk of process.stdin) {
            data += chunk;
        }

        if (!data) {
            throw new Error('No data provided to stdin');
        }

        const args = JSON.parse(data);
        const { userId } = args;

        if (!userId) {
            throw new Error('UserId is required');
        }

        const plans = await prisma.studyPlan.findMany({
            where: { userId },
            include: {
                scheduledTopics: true
            },
            orderBy: { createdAt: 'desc' },
        });

        console.log(JSON.stringify({ success: true, data: plans }));

    } catch (error) {
        console.error(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }));
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
