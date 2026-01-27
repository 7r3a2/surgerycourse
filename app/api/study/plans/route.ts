import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
        }

        const plans = await prisma.studyPlan.findMany({
            where: { userId },
            include: {
                scheduledTopics: true
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(plans);
    } catch (error) {
        console.error('Error fetching study plans:', error);
        return NextResponse.json({
            error: 'Failed to fetch study plans',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, name, startDate, endDate, topicSchedule } = body;

        if (!userId || !name || !startDate || !endDate || !topicSchedule) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

        return NextResponse.json(plan);

    } catch (error) {
        console.error('Error creating study plan:', error);
        return NextResponse.json({
            error: 'Failed to create study plan',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
