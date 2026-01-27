import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, dueDate } = body;

        const topic = await prisma.topic.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
            },
        });

        return NextResponse.json(topic);
    } catch (error) {
        console.error('Error updating topic:', error);
        return NextResponse.json(
            {
                error: 'Failed to update topic',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log(`DELETE request for Topic ID: ${id}`);
        await prisma.topic.delete({
            where: { id },
        });
        console.log(`Successfully deleted Topic ID: ${id}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting topic:', error);
        return NextResponse.json(
            {
                error: 'Failed to delete topic',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
