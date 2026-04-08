import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, examDate, color, sourceSubjectId, sourceMainSubjectId } = body;

        const examSubject = await prisma.examSubject.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(examDate && { examDate: new Date(examDate) }),
                ...(color && { color }),
                ...(sourceSubjectId !== undefined && { sourceSubjectId }),
                ...(sourceMainSubjectId !== undefined && { sourceMainSubjectId }),
            },
        });

        return NextResponse.json(examSubject);
    } catch (error) {
        console.error('Error updating exam subject:', error);
        return NextResponse.json(
            { error: 'Failed to update exam subject', details: error instanceof Error ? error.message : String(error) },
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
        await prisma.examSubject.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting exam subject:', error);
        return NextResponse.json(
            { error: 'Failed to delete exam subject', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
