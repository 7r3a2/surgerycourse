import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { completed } = body;

        if (completed === undefined) {
            return NextResponse.json({ error: 'Missing completed status' }, { status: 400 });
        }

        const topic = await prisma.scheduledTopic.update({
            where: { id },
            data: { completed },
        });

        return NextResponse.json(topic);
    } catch (error) {
        console.error('Error updating scheduled topic:', error);
        return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
    }
}
