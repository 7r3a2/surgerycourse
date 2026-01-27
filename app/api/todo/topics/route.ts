import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Topic POST request body:', body);
        const { subjectId, title, order, dueDate } = body;

        const topic = await prisma.topic.create({
            data: {
                subjectId,
                title,
                order: order || 0,
                dueDate: dueDate ? new Date(dueDate) : null,
            },
        });
        console.log('Successfully created Topic:', topic.id);

        return NextResponse.json(topic);
    } catch (error) {
        console.error('Error creating topic:', error);
        return NextResponse.json(
            { error: 'Failed to create topic', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
