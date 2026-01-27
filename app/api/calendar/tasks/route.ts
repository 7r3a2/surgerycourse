import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
        }

        const tasks = await prisma.calendarTask.findMany({
            where: { userId },
            orderBy: { date: 'asc' },
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching calendar tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, title, date } = body;

        if (!userId || !title || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const task = await prisma.calendarTask.create({
            data: {
                userId,
                title,
                date: new Date(date),
            },
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error creating calendar task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
