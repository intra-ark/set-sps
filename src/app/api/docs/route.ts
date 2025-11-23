import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const file = searchParams.get('file');

        if (!file) {
            return NextResponse.json({ error: 'File parameter required' }, { status: 400 });
        }

        // Security: prevent directory traversal
        if (file.includes('..') || file.includes('/')) {
            return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
        }

        const filePath = path.join(process.cwd(), 'docs', `${file}.md`);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const content = fs.readFileSync(filePath, 'utf-8');

        return new NextResponse(content, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
    } catch (error) {
        console.error('Error reading doc file:', error);
        return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
    }
}
