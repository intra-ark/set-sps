import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { headerImageUrl } = await request.json();
        const { id } = await params;
        const lineId = parseInt(id);

        const updated = await prisma.line.update({
            where: { id: lineId },
            data: { headerImageUrl }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating line:', error);
        return NextResponse.json({ error: 'Failed to update line' }, { status: 500 });
    }
}
