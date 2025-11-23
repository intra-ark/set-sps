import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const db2023 = {
  "NL AD6-1250A": { dt: "1.519,13", ut: "1.359,65", nva: "159,48", kd: "0,895", ke: "0,673", ker: "0,723", otr: "2100,31", tsr: "290382,902", ksr: "0,723" },
  "NL AD6-2500A": { dt: "1.384,64", ut: "1.244,38", nva: "140,25", kd: "0,898", ke: "0,673", ker: "0,723", otr: "1914,37", tsr: "290382,902", ksr: "0,723" },
  "NL CL6-1250A": { dt: "1.328,46", ut: "1.199,44", nva: "129,02", kd: "0,902", ke: "0,673", ker: "0,723", otr: "1836,69", tsr: "290382,902", ksr: "0,723" },
  "NL GL6-1250A": { dt: "1.292,90", ut: "1.171,16", nva: "121,74", kd: "0,905", ke: "0,673", ker: "0,723", otr: "1787,53", tsr: "290382,902", ksr: "0,723" },
  "XE AD6-1250A": { dt: "1.316,73", ut: "632,02", nva: "684,71", kd: "0,479", ke: "0,673", ker: "0,723", otr: "1820,48", tsr: "290382,902", ksr: "0,723" },
  "XE TT6-1250A": { dt: "994,25", ut: "13,44", nva: "980,81", kd: "0,013", ke: "0,673", ker: "0,723", otr: "1374,62", tsr: "290382,902", ksr: "0,723" },
};
const db2024 = {
  "XE AD6-1250A": { dt: "1308,4", ut: "937,45", nva: "370,95", kd: "0,716", ke: "0,733", ker: "0,783", otr: "1669,14", tsr: "#DIV/0!", ksr: "" },
  "XE AD6-2500A": { dt: "1338,4", ut: "967,45", nva: "370,95", kd: "0,722", ke: "0,733", ker: "0,783", otr: "1707,41", tsr: "#DIV/0!", ksr: "" },
  "NL GL6-1250A": { dt: "1.345,72", ut: "975,36", nva: "370,36", kd: "0,725", ke: "0,755", ker: "0,805", otr: "1671,72", tsr: "#DIV/0!", ksr: "" },
};
const db2025 = {
  "XE AD6-1250A": { dt: "1.335,40", ut: "944,45", nva: "390,95", kd: "0,707", ke: "0,755", ker: "0,805", otr: "1658,9", tsr: "#DIV/0!", ksr: "" },
  "XE GL6-1250A": { dt: "1.307,62", ut: "935,13", nva: "372,49", kd: "0,715", ke: "0,755", ker: "0,805", otr: "1624,39", tsr: "#DIV/0!", ksr: "" },
};

const ALL_DB: any = { '2023': db2023, '2024': db2024, '2025': db2025 };

function parseValue(val: string) {
  if (!val || val === "#DIV/0!") return null;
  // Remove thousands separator (.) and replace decimal separator (,) with (.)
  // Example: "1.519,13" -> "1519.13"
  // Example: "0,895" -> "0.895"
  // Example: "1308,4" -> "1308.4"

  // First remove all dots (thousands separators)
  let clean = val.replace(/\./g, '');
  // Then replace comma with dot
  clean = clean.replace(',', '.');

  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

async function main() {
  // Create Lines
  const lines = [
    { name: 'F400', slug: 'f400', headerImageUrl: '/F400i.png' },
    { name: 'MC Set', slug: 'mc-set', headerImageUrl: null },
    { name: 'Okken', slug: 'okken', headerImageUrl: null },
    { name: 'Line 4', slug: 'line-4', headerImageUrl: null },
    { name: 'Line 5', slug: 'line-5', headerImageUrl: null },
    { name: 'Line 6', slug: 'line-6', headerImageUrl: null },
  ];

  for (const lineData of lines) {
    await prisma.line.upsert({
      where: { slug: lineData.slug },
      update: { headerImageUrl: lineData.headerImageUrl },
      create: lineData,
    });
  }

  const f400Line = await prisma.line.findUnique({ where: { slug: 'f400' } });
  const mcSetLine = await prisma.line.findUnique({ where: { slug: 'mc-set' } });
  const okkenLine = await prisma.line.findUnique({ where: { slug: 'okken' } });

  if (!f400Line || !mcSetLine || !okkenLine) {
    throw new Error('Failed to create lines');
  }

  // Seed F400 Data (Existing)
  for (const yearStr of Object.keys(ALL_DB)) {
    const year = parseInt(yearStr);
    const products = ALL_DB[yearStr];

    for (const productName of Object.keys(products)) {
      const data = products[productName];

      // Find or create product linked to F400
      const product = await prisma.product.upsert({
        where: { name: productName },
        update: { lineId: f400Line.id },
        create: { name: productName, lineId: f400Line.id },
      });

      // Create YearData
      await prisma.yearData.upsert({
        where: {
          productId_year: {
            productId: product.id,
            year: year
          }
        },
        update: {
          dt: parseValue(data.dt),
          ut: parseValue(data.ut),
          nva: parseValue(data.nva),
          kd: parseValue(data.kd),
          ke: parseValue(data.ke),
          ker: parseValue(data.ker),
          ksr: parseValue(data.ksr),
          otr: parseValue(data.otr),
          tsr: data.tsr,
        },
        create: {
          productId: product.id,
          year: year,
          dt: parseValue(data.dt),
          ut: parseValue(data.ut),
          nva: parseValue(data.nva),
          kd: parseValue(data.kd),
          ke: parseValue(data.ke),
          ker: parseValue(data.ker),
          ksr: parseValue(data.ksr),
          otr: parseValue(data.otr),
          tsr: data.tsr,
        }
      });
    }
  }

  // Helper to generate random float between min and max
  const randomFloat = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

  // Helper to generate random SPS data
  const generateSPSData = () => {
    const ot = randomFloat(1200, 2500);
    const dt = randomFloat(ot * 0.6, ot * 0.8);
    const ut = randomFloat(dt * 0.7, dt * 0.95);
    const nva = ot - ut; // Simplified logic
    const kd = ut / ot;

    return {
      dt,
      ut,
      nva,
      kd,
      ke: randomFloat(0.6, 0.9),
      ker: randomFloat(0.65, 0.95),
      ksr: randomFloat(0.7, 0.9),
      otr: ot,
      tsr: Math.floor(randomFloat(100000, 999999)).toString()
    };
  };

  // Dynamic Seeding for All Lines
  const linesToSeed = [
    { line: mcSetLine, prefix: 'MC', count: 8 },
    { line: okkenLine, prefix: 'OK', count: 10 },
    { line: await prisma.line.findUnique({ where: { slug: 'line-4' } }), prefix: 'L4', count: 5 },
    { line: await prisma.line.findUnique({ where: { slug: 'line-5' } }), prefix: 'L5', count: 6 },
    { line: await prisma.line.findUnique({ where: { slug: 'line-6' } }), prefix: 'L6', count: 4 },
  ];

  for (const { line, prefix, count } of linesToSeed) {
    if (!line) continue;

    for (let i = 1; i <= count; i++) {
      const productName = `${prefix}-${100 * i} Series`;

      const product = await prisma.product.upsert({
        where: { name: productName },
        update: { lineId: line.id },
        create: { name: productName, lineId: line.id },
      });

      // Generate data for 2023-2027
      for (let year = 2023; year <= 2027; year++) {
        // 80% chance of having data for a year
        if (Math.random() > 0.2) {
          const data = generateSPSData();
          await prisma.yearData.upsert({
            where: { productId_year: { productId: product.id, year } },
            update: data,
            create: { productId: product.id, year, ...data }
          });
        }
      }
    }
  }

  // Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'Manisa.1984'; // Correct password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { username: 'ahmet mersin' },
    update: {
      role: 'ADMIN',
      password: hashedPassword, // Update password if user exists
    },
    create: {
      username: 'ahmet mersin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
