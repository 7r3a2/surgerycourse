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

        const mainSubject = await prisma.mainSubject.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(color && { color }),
                ...(order !== undefined && { order }),
            },
        });

        return NextResponse.json(mainSubject);
    } catch (error) {
        console.error('Error updating main subject:', error);
        return NextResponse.json(
            {
                error: 'Failed to update main subject',
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
        console.log(`DELETE request for MainSubject ID: ${id}`);
        await prisma.mainSubject.delete({
            where: { id },
        });
        console.log(`Successfully deleted MainSubject ID: ${id}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting main subject:', error);
        return NextResponse.json(
            {
                error: 'Failed to delete main subject',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
