import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const mainSubjects = await prisma.mainSubject.findMany({
            include: {
                subjects: {
                    include: {
                        topics: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return NextResponse.json(mainSubjects);
    } catch (error) {
        console.error('Error fetching main subjects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch main subjects' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('MainSubject POST request body:', body);
        const { title, description, color, order } = body;

        const mainSubject = await prisma.mainSubject.create({
            data: {
                title,
                description: description || null,
                color,
                order: order || 0,
            },
            include: {
                subjects: {
                    include: {
                        topics: true,
                    },
                },
            },
        });
        console.log('Successfully created MainSubject:', mainSubject.id);

        return NextResponse.json(mainSubject);
    } catch (error) {
        console.error('Error creating main subject:', error);
        return NextResponse.json(
            { error: 'Failed to create main subject', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
