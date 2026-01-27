import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        // Try to count users as a simple connectivity test
        const userCount = await prisma.user.count();
        return NextResponse.json({
            status: 'success',
            message: 'Database connected successfully',
            userCount
        });
    } catch (error: any) {
        console.error('Diagnostic DB error:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Database connection failed',
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
