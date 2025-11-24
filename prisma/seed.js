const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding sample data...');

    // Create sample lines
    const lines = await Promise.all([
        prisma.line.upsert({
            where: { slug: 'main-assembly' },
            update: {},
            create: {
                name: 'Main Assembly Line',
                slug: 'main-assembly',
                headerImageUrl: '/schneider_f400_diagram.png'
            }
        }),
        prisma.line.upsert({
            where: { slug: 'secondary-line' },
            update: {},
            create: {
                name: 'Secondary Production',
                slug: 'secondary-line',
                headerImageUrl: '/schneider_f400_diagram.png'
            }
        })
    ]);

    console.log('✅ Created lines');

    // Create sample products with realistic manufacturing data
    const products = [
        { name: 'GL6-1250A', lineId: lines[0].id },
        { name: 'GL6-1600A', lineId: lines[0].id },
        { name: 'GL6-2000A', lineId: lines[0].id },
        { name: 'NL GL6-1250A', lineId: lines[0].id },
        { name: 'PowerLogic PM5000', lineId: lines[1].id },
        { name: 'EasyLogic PM3000', lineId: lines[1].id },
    ];

    for (const productData of products) {
        // Check if product exists
        let product = await prisma.product.findFirst({
            where: {
                name: productData.name,
                lineId: productData.lineId
            }
        });

        // Create if doesn't exist
        if (!product) {
            product = await prisma.product.create({
                data: {
                    name: productData.name,
                    lineId: productData.lineId,
                    image: null
                }
            });
        }

        // Generate realistic year data (2023-2027)
        const years = [2023, 2024, 2025, 2026, 2027];

        for (const year of years) {
            // Simulate improvement over years
            const yearIndex = years.indexOf(year);
            const improvementFactor = 1 + (yearIndex * 0.05); // 5% improvement per year

            const baseKD = 0.75 + (Math.random() * 0.15); // 75-90% base efficiency
            const kd = Math.min(0.95, baseKD * improvementFactor);

            const dt = 45 + (Math.random() * 15); // 45-60 min cycle time
            const ut = 85 + (Math.random() * 10); // 85-95% uptime
            const nva = 15 - (yearIndex * 2) + (Math.random() * 5); // Decreasing waste

            const otr = dt + ut + nva;
            const ke = ut / otr;
            const ker = dt / ut;
            const ksr = otr / dt;

            await prisma.yearData.upsert({
                where: {
                    productId_year: {
                        productId: product.id,
                        year: year
                    }
                },
                update: {
                    dt: parseFloat(dt.toFixed(2)),
                    ut: parseFloat(ut.toFixed(2)),
                    nva: parseFloat(nva.toFixed(2)),
                    kd: parseFloat(kd.toFixed(4)),
                    ke: parseFloat(ke.toFixed(4)),
                    ker: parseFloat(ker.toFixed(4)),
                    ksr: parseFloat(ksr.toFixed(4)),
                    otr: parseFloat(otr.toFixed(2)),
                    tsr: `${(kd * 100).toFixed(1)}%`
                },
                create: {
                    productId: product.id,
                    year: year,
                    dt: parseFloat(dt.toFixed(2)),
                    ut: parseFloat(ut.toFixed(2)),
                    nva: parseFloat(nva.toFixed(2)),
                    kd: parseFloat(kd.toFixed(4)),
                    ke: parseFloat(ke.toFixed(4)),
                    ker: parseFloat(ker.toFixed(4)),
                    ksr: parseFloat(ksr.toFixed(4)),
                    otr: parseFloat(otr.toFixed(2)),
                    tsr: `${(kd * 100).toFixed(1)}%`
                }
            });
        }

        console.log(`✅ Created product: ${product.name}`);
    }

    // Update global settings
    await prisma.globalSettings.upsert({
        where: { id: 1 },
        update: {},
        create: {
            headerImageUrl: '/schneider_f400_diagram.png',
            availableYears: [2023, 2024, 2025, 2026, 2027]
        }
    });

    console.log('✅ Updated global settings');
    console.log('🎉 Sample data seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
