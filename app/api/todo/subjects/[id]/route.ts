import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description, color, order } = body;

        const subject = await prisma.subject.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(color && { color }),
                ...(order !== undefined && { order }),
            },
        });

        return NextResponse.json(subject);
    } catch (error) {
        console.error('Error updating subject:', error);
        return NextResponse.json(
            {
                error: 'Failed to update subject',
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
        console.log(`DELETE request for Subject ID: ${id}`);
        await prisma.subject.delete({
            where: { id },
        });
        console.log(`Successfully deleted Subject ID: ${id}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting subject:', error);
        return NextResponse.json(
            {
                error: 'Failed to delete subject',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
