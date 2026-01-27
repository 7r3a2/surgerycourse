import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Subject POST request body:', body);
        const { mainSubjectId, title, description, color, order } = body;

        const subject = await prisma.subject.create({
            data: {
                mainSubjectId,
                title,
                description: description || null,
                color,
                order: order || 0,
            },
            include: {
                topics: true,
            },
        });
        console.log('Successfully created Subject:', subject.id);

        return NextResponse.json(subject);
    } catch (error) {
        console.error('Error creating subject:', error);
        return NextResponse.json(
            { error: 'Failed to create subject', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
