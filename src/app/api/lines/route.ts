import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserLines } from '@/lib/permissions';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(session.user.id);
        const userRole = session.user.role;

        // Get lines based on user permissions
        const lines = await getUserLines(userId, userRole);

        return NextResponse.json(lines);
    } catch (error) {
        console.error('Error fetching lines:', error);
        return NextResponse.json({ error: 'Failed to fetch lines' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, slug } = await request.json();

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        }

        const line = await prisma.line.create({
            data: {
                name,
                slug
            }
        });

        return NextResponse.json(line, { status: 201 });
    } catch (error) {
        console.error('Error creating line:', error);
        return NextResponse.json({ error: 'Failed to create line' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Line ID is required' }, { status: 400 });
        }

        await prisma.line.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: 'Line deleted successfully' });
    } catch (error) {
        console.error('Error deleting line:', error);
        return NextResponse.json({ error: 'Failed to delete line' }, { status: 500 });
    }
}

