import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET completions for a user
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const completions = await prisma.topicCompletion.findMany({
            where: { userId },
            select: { topicId: true, completed: true },
        });

        // Convert to a record for easier frontend handling: { topicId: true }
        const completionMap = completions.reduce((acc: any, curr: any) => {
            acc[curr.topicId] = curr.completed;
            return acc;
        }, {} as Record<string, boolean>);

        return NextResponse.json(completionMap);
    } catch (error) {
        console.error('Fetch completions error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST toggle completion
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, topicId, completed } = body;

        if (!userId || !topicId) {
            return NextResponse.json({ error: 'User ID and Topic ID are required' }, { status: 400 });
        }

        if (completed) {
            // Add completion
            const completion = await prisma.topicCompletion.upsert({
                where: {
                    userId_topicId: { userId, topicId },
                },
                update: { completed: true },
                create: { userId, topicId, completed: true },
            });
            return NextResponse.json(completion);
        } else {
            // Remove completion
            await prisma.topicCompletion.deleteMany({
                where: { userId, topicId },
            });
            return NextResponse.json({ success: true });
        }
    } catch (error) {
        console.error('Toggle completion error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
