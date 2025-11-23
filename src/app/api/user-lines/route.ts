import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: Fetch line assignments for a user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const assignments = await prisma.userLine.findMany({
            where: { userId: parseInt(userId) },
            include: { line: true }
        });

        return NextResponse.json(assignments);
    } catch (error) {
        console.error('Error fetching user line assignments:', error);
        return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
    }
}

// POST: Assign lines to a user (replaces all existing assignments)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, lineIds } = await request.json();

        if (!userId || !Array.isArray(lineIds)) {
            return NextResponse.json({ error: 'User ID and line IDs array are required' }, { status: 400 });
        }

        // Delete existing assignments
        await prisma.userLine.deleteMany({
            where: { userId: parseInt(userId) }
        });

        // Create new assignments
        if (lineIds.length > 0) {
            await prisma.userLine.createMany({
                data: lineIds.map(lineId => ({
                    userId: parseInt(userId),
                    lineId: parseInt(lineId)
                }))
            });
        }

        // Fetch updated assignments
        const assignments = await prisma.userLine.findMany({
            where: { userId: parseInt(userId) },
            include: { line: true }
        });

        return NextResponse.json(assignments);
    } catch (error) {
        console.error('Error assigning lines to user:', error);
        return NextResponse.json({ error: 'Failed to assign lines' }, { status: 500 });
    }
}

// DELETE: Remove a specific line assignment
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const lineId = searchParams.get('lineId');

        if (!userId || !lineId) {
            return NextResponse.json({ error: 'User ID and Line ID are required' }, { status: 400 });
        }

        await prisma.userLine.delete({
            where: {
                userId_lineId: {
                    userId: parseInt(userId),
                    lineId: parseInt(lineId)
                }
            }
        });

        return NextResponse.json({ message: 'Line assignment removed successfully' });
    } catch (error) {
        console.error('Error removing line assignment:', error);
        return NextResponse.json({ error: 'Failed to remove assignment' }, { status: 500 });
    }
}
