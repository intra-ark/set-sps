import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper to get or create settings
async function getSettings() {
    let settings = await prisma.globalSettings.findFirst();
    if (!settings) {
        settings = await prisma.globalSettings.create({
            data: {
                availableYears: [2023, 2024, 2025, 2026, 2027]
            }
        });
    }
    return settings;
}

export async function GET() {
    try {
        const settings = await getSettings();
        // Sort years descending
        const years = [...settings.availableYears].sort((a, b) => b - a);
        return NextResponse.json(years);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch years' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_USER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { year } = await request.json();
        if (!year || typeof year !== 'number' || year < 2000 || year > 2100) {
            return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
        }

        const settings = await getSettings();
        if (settings.availableYears.includes(year)) {
            return NextResponse.json({ error: 'Year already exists' }, { status: 400 });
        }

        const updated = await prisma.globalSettings.update({
            where: { id: settings.id },
            data: {
                availableYears: {
                    push: year
                }
            }
        });

        return NextResponse.json(updated.availableYears.sort((a, b) => b - a));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add year' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_USER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { year } = await request.json();
        if (!year) {
            return NextResponse.json({ error: 'Year is required' }, { status: 400 });
        }

        const settings = await getSettings();
        const newYears = settings.availableYears.filter(y => y !== year);

        const updated = await prisma.globalSettings.update({
            where: { id: settings.id },
            data: {
                availableYears: newYears
            }
        });

        return NextResponse.json(updated.availableYears.sort((a, b) => b - a));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete year' }, { status: 500 });
    }
}
