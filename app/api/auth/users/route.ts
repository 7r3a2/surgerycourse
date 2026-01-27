import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all users (Admin only)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const username = searchParams.get('username');

        let users;

        if (id) {
            const user = await prisma.user.findUnique({ where: { id } });
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            users = [user];
        } else if (username) {
            const user = await prisma.user.findUnique({ where: { username } });
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            users = [user];
        } else {
            users = await prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
            });
        }

        const usersWithoutPassword = users.map((user: any) => {
            const { password, ...rest } = user;
            return rest;
        });

        if (id || username) {
            return NextResponse.json(usersWithoutPassword[0]);
        }

        return NextResponse.json(usersWithoutPassword);
    } catch (error) {
        console.error('Fetch users error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE user
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH update user (e.g., reset password)
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, password, isAdmin } = body;

        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (password !== undefined) updateData.password = password;
        if (isAdmin !== undefined) updateData.isAdmin = isAdmin;

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        const { password: _, ...rest } = user;
        return NextResponse.json(rest);
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
