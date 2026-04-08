import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const examSubjects = await prisma.examSubject.findMany({
            orderBy: { examDate: 'asc' },
        });

        return NextResponse.json(examSubjects);
    } catch (error) {
        console.error('Error fetching exam subjects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch exam subjects', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, examDate, color, sourceSubjectId, sourceMainSubjectId } = body;

        const examSubject = await prisma.examSubject.create({
            data: {
                title,
                examDate: new Date(examDate),
                color: color || '#0d9488',
                sourceSubjectId: sourceSubjectId || null,
                sourceMainSubjectId: sourceMainSubjectId || null,
            },
        });

        return NextResponse.json(examSubject);
    } catch (error) {
        console.error('Error creating exam subject:', error);
        return NextResponse.json(
            { error: 'Failed to create exam subject', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
