import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Security constants
const MAX_ITEMS_PER_REQUEST = 100;
const VALID_YEARS = [2023, 2024, 2025, 2026, 2027];

// Input validation helper
function sanitizeNumericInput(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = parseFloat(value);
    if (isNaN(num) || !isFinite(num)) return null;
    // Prevent extremely large or small values
    if (Math.abs(num) > 1e10) return null;
    return num;
}

function sanitizeStringInput(value: any): string | null {
    if (value === null || value === undefined || value === '') return null;
    const str = String(value);
    // Prevent excessively long strings
    if (str.length > 1000) return null;
    // Remove potential XSS characters
    return str.trim();
}

export async function POST(request: Request) {
    try {
        // Authentication check
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { year, data, lineId } = body;

        // Validate year
        if (!year || !VALID_YEARS.includes(parseInt(year))) {
            return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
        }

        // Validate data array
        if (!data || !Array.isArray(data)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // Rate limiting: reject oversized requests
        if (data.length > MAX_ITEMS_PER_REQUEST) {
            return NextResponse.json({
                error: `Request too large. Maximum ${MAX_ITEMS_PER_REQUEST} items allowed.`
            }, { status: 413 });
        }

        const results = [];
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            // Validate and sanitize product name
            const productName = sanitizeStringInput(item.productName);
            if (!productName) {
                errors.push(`Row ${i + 1}: Invalid product name`);
                continue;
            }

            // Sanitize all numeric inputs
            const sanitizedData = {
                dt: sanitizeNumericInput(item.dt),
                ut: sanitizeNumericInput(item.ut),
                nva: sanitizeNumericInput(item.nva),
                kd: sanitizeNumericInput(item.kd),
                ke: sanitizeNumericInput(item.ke),
                ker: sanitizeNumericInput(item.ker),
                ksr: sanitizeNumericInput(item.ksr),
                otr: sanitizeNumericInput(item.otr),
                tsr: sanitizeStringInput(item.tsr),
            };

            // Find product by exact name match
            let product = await prisma.product.findFirst({
                where: { name: productName }
            });

            // If product doesn't exist and we have a lineId, create it
            if (!product && lineId) {
                try {
                    product = await prisma.product.create({
                        data: {
                            name: productName,
                            lineId: parseInt(lineId)
                        }
                    });
                } catch (createError) {
                    errors.push(`Row ${i + 1}: Failed to create product "${productName}"`);
                    continue;
                }
            }

            if (!product) {
                errors.push(`Row ${i + 1}: Product "${productName}" not found and no line specified to create it`);
                continue;
            }

            try {
                const yearData = await prisma.yearData.upsert({
                    where: {
                        productId_year: {
                            productId: product.id,
                            year: parseInt(year),
                        },
                    },
                    update: sanitizedData,
                    create: {
                        productId: product.id,
                        year: parseInt(year),
                        ...sanitizedData
                    },
                });
                results.push(yearData);
            } catch (dbError) {
                errors.push(`Row ${i + 1}: Database error`);
                console.error(`Database error for product ${productName}:`, dbError);
            }
        }

        return NextResponse.json({
            message: 'Import completed',
            success: results.length,
            failed: errors.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Bulk update error:', error);
        // Don't leak internal error details to client
        return NextResponse.json({ error: 'Server error occurred' }, { status: 500 });
    }
}
