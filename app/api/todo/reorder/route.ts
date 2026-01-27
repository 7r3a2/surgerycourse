import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { type, items } = await request.json();

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
        }

        // Use transaction to update all orders
        await prisma.$transaction(
            items.map((item: any, index: number) => {
                if (type === 'mainSubject') {
                    return prisma.mainSubject.update({
                        where: { id: item.id },
                        data: { order: index },
                    });
                } else if (type === 'subject') {
                    return prisma.subject.update({
                        where: { id: item.id },
                        data: { order: index },
                    });
                } else if (type === 'topic') {
                    return prisma.topic.update({
                        where: { id: item.id },
                        data: { order: index },
                    });
                }
                throw new Error('Invalid type');
            })
        );

        console.log(`Successfully reordered ${items.length} ${type}s`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordering:', error);
        return NextResponse.json(
            {
                error: 'Failed to reorder',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
