/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canUserAccessLine } from '@/lib/permissions';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const lineId = parseInt(id);
        const userId = parseInt(session.user.id);
        const userRole = session.user.role;

        // Check if user has permission to edit this line
        const hasAccess = await canUserAccessLine(userId, lineId, userRole);
        if (!hasAccess) {
            return NextResponse.json({ error: 'Access denied to this line' }, { status: 403 });
        }

        const { headerImageUrl, name, slug } = await request.json();

        // Only admins can update name and slug
        const updateData: any = {};
        if (headerImageUrl !== undefined) {
            updateData.headerImageUrl = headerImageUrl;
        }
        if (userRole === 'ADMIN') {
            if (name !== undefined) updateData.name = name;
            if (slug !== undefined) updateData.slug = slug;
        }

        const updated = await prisma.line.update({
            where: { id: lineId },
            data: updateData
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating line:', error);
        return NextResponse.json({ error: 'Failed to update line' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const lineId = parseInt(id);

        await prisma.line.delete({
            where: { id: lineId }
        });

        return NextResponse.json({ message: 'Line deleted successfully' });
    } catch (error) {
        console.error('Error deleting line:', error);
        return NextResponse.json({ error: 'Failed to delete line' }, { status: 500 });
    }
}

