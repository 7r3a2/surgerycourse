import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
        }

        const colors = await prisma.dayColor.findMany({
            where: { userId },
        });

        return NextResponse.json(colors);
    } catch (error) {
        console.error('Error fetching calendar day colors:', error);
        return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, date, color } = body;

        if (!userId || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const formattedDate = new Date(date);
        formattedDate.setHours(0, 0, 0, 0);

        if (!color) {
            // If color is empty/null, delete the entry
            await prisma.dayColor.deleteMany({
                where: {
                    userId,
                    date: formattedDate,
                },
            });
            return NextResponse.json({ success: true, deleted: true });
        }

        const dayColor = await prisma.dayColor.upsert({
            where: {
                userId_date: {
                    userId,
                    date: formattedDate,
                },
            },
            update: { color },
            create: {
                userId,
                date: formattedDate,
                color,
            },
        });

        return NextResponse.json(dayColor);
    } catch (error) {
        console.error('Error setting calendar day color:', error);
        return NextResponse.json({ error: 'Failed to set color' }, { status: 500 });
    }
}
