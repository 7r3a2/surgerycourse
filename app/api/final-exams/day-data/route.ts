import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
        const record = await prisma.finalExamDayData.findUnique({
            where: { userId },
        });
        return NextResponse.json(record?.data ?? {});
    } catch (error) {
        console.error('Error fetching day data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch day data' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
        const data = await request.json();

        await prisma.finalExamDayData.upsert({
            where: { userId },
            create: { userId, data },
            update: { data },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error saving day data:', error);
        return NextResponse.json(
            { error: 'Failed to save day data' },
            { status: 500 }
        );
    }
}
