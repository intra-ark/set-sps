import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const lines = await prisma.line.findMany({
            orderBy: { id: 'asc' }
        });
        return NextResponse.json(lines);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch lines' }, { status: 500 });
    }
}
