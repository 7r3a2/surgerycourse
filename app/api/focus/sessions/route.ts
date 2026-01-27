import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const sessions = await prisma.focusSession.findMany({
            orderBy: {
                completedAt: 'desc',
            },
            take: 10,
        });

        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching focus sessions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch focus sessions' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { duration, completedAt, subjectName, topicName } = body;

        const session = await prisma.focusSession.create({
            data: {
                duration,
                completedAt,
                subjectName: subjectName || null,
                topicName: topicName || null,
            },
        });

        return NextResponse.json(session);
    } catch (error) {
        console.error('Error creating focus session:', error);
        return NextResponse.json(
            { error: 'Failed to create focus session' },
            { status: 500 }
        );
    }
}
