import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { Line, Product, YearData } from '@prisma/client';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Only allow Admin users
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all data
        const lines = await prisma.line.findMany({ orderBy: { name: 'asc' } });
        const products = await prisma.product.findMany({
            include: { yearData: true, line: true },
            orderBy: { name: 'asc' }
        });

        // Create workbook
        const workbook = XLSX.utils.book_new();

        // Lines sheet
        const linesData = lines.map((line: Line) => ({
            'ID': line.id,
            'Name': line.name,
            'Slug': line.slug,
            'Header Image': line.headerImageUrl || 'N/A',
            'Created At': new Date(line.createdAt).toLocaleDateString(),
        }));
        const linesSheet = XLSX.utils.json_to_sheet(linesData);
        XLSX.utils.book_append_sheet(workbook, linesSheet, 'Lines');

        // Products with Year Data sheet
        const productsData: Record<string, string | number>[] = [];
        products.forEach((product: Product & { yearData: YearData[]; line: Line | null }) => {
            product.yearData.forEach((yd: YearData) => {
                productsData.push({
                    'Product ID': product.id,
                    'Product Name': product.name,
                    'Line': product.line?.name || 'N/A',
                    'Year': yd.year,
                    'DT': yd.dt,
                    'UT': yd.ut,
                    'NVA': yd.nva,
                    'KD (%)': yd.kd ? (yd.kd * 100).toFixed(2) : 'N/A',
                    'KE (%)': yd.ke ? (yd.ke * 100).toFixed(2) : 'N/A',
                    'KER (%)': yd.ker ? (yd.ker * 100).toFixed(2) : 'N/A',
                    'KSR (%)': yd.ksr ? (yd.ksr * 100).toFixed(2) : 'N/A',
                    'OT': yd.otr,
                    'TSR': yd.tsr || 'N/A',
                });
            });
        });
        const productsSheet = XLSX.utils.json_to_sheet(productsData);
        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products & Year Data');

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(excelBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="set-sps-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
            },
        });
    } catch (error) {
        console.error('Excel export error:', error);
        return NextResponse.json({ error: 'Failed to export Excel' }, { status: 500 });
    }
}
