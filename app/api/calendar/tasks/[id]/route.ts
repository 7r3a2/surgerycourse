import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { completed, title } = body;

        const task = await prisma.calendarTask.update({
            where: { id },
            data: {
                ...(completed !== undefined && { completed }),
                ...(title && { title }),
            },
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error updating calendar task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.calendarTask.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting calendar task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
