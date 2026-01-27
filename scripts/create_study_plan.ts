import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // Read JSON from stdin
        let data = '';
        for await (const chunk of process.stdin) {
            data += chunk;
        }

        if (!data) {
            throw new Error('No data provided to stdin');
        }

        const body = JSON.parse(data);
        const { userId, name, startDate, endDate, topicSchedule } = body;

        if (!userId || !name || !startDate || !endDate || !topicSchedule) {
            throw new Error('Missing required fields');
        }

        const plan = await prisma.studyPlan.create({
            data: {
                userId,
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                scheduledTopics: {
                    create: topicSchedule.map((t: any) => ({
                        topicId: t.topicId,
                        topicTitle: t.topicTitle,
                        subjectId: t.subjectId,
                        subjectTitle: t.subjectTitle,
                        mainSubjectId: t.mainSubjectId,
                        mainSubjectTitle: t.mainSubjectTitle,
                        subjectColor: t.subjectColor,
                        scheduledDate: new Date(t.scheduledDate),
                        completed: t.completed || false
                    }))
                }
            },
            include: {
                scheduledTopics: true
            }
        });

        console.log(JSON.stringify({ success: true, data: plan }));

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
