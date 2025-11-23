import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lineId = searchParams.get('lineId');

    try {
        const where = lineId ? { lineId: parseInt(lineId) } : {};
        const products = await prisma.product.findMany({
            where,
            include: {
                yearData: true,
            },
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, image, lineId } = body;

        const product = await prisma.product.create({
            data: {
                name,
                image,
                lineId: lineId ? parseInt(lineId) : undefined,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
