// Shared utility functions for common calculations across the application

export interface YearData {
    id?: number;
    year: number;
    dt: number | null;
    ut: number | null;
    nva: number | null;
    kd: number | null;
    ke: number | null;
    ker: number | null;
    ksr: number | null;
    otr: number | null;
    tsr?: string | null;
}

export interface Product {
    id: number;
    name: string;
    lineId: number;
    yearData: YearData[];
}

export interface Line {
    id: number;
    name: string;
    slug: string;
    headerImageUrl: string | null;
}

export interface StarProduct {
    name: string;
    kd: number;
}

/**
 * Get the latest year data for a product
 */
export function getLatestYearData(product: Product): YearData | undefined {
    if (!product.yearData || product.yearData.length === 0) return undefined;
    return [...product.yearData].sort((a, b) => b.year - a.year)[0];
}

/**
 * Find the product with the best KD performance from a list
 */
export function findStarProduct(products: Product[]): StarProduct | null {
    let starProduct: StarProduct | null = null;

    products.forEach(p => {
        const latest = getLatestYearData(p);
        if (latest?.kd) {
            if (!starProduct || latest.kd > starProduct.kd) {
                starProduct = { name: p.name, kd: latest.kd };
            }
        }
    });

    return starProduct;
}

/**
 * Format KD value as percentage string
 */
export function formatKDPercent(kd: number | null | undefined): string {
    if (kd == null) return 'N/A';
    return `${(kd * 100).toFixed(1)}%`;
}

/**
 * Format any number with optional decimal places
 */
export function formatNumber(value: number | null | undefined, decimals: number = 2): string {
    if (value == null) return '';
    return value.toFixed(decimals);
}

/**
 * Calculate global statistics from all products
 */
export interface GlobalStats {
    totalProducts: number;
    totalLines: number;
    averageKD: number;
    globalOT: number;
    globalDT: number;
    globalUT: number;
    globalNVA: number;
}

export function calculateGlobalStats(products: Product[], linesCount: number = 0): GlobalStats {
    let totalOT = 0, totalDT = 0, totalUT = 0, totalNVA = 0;
    let totalKD = 0;
    let kdCount = 0;
    let metricsCount = 0;

    products.forEach(p => {
        const latest = getLatestYearData(p);
        if (latest) {
            if (latest.otr != null && latest.dt != null && latest.ut != null && latest.nva != null) {
                totalOT += latest.otr;
                totalDT += latest.dt;
                totalUT += latest.ut;
                totalNVA += latest.nva;
                metricsCount++;
            }
            if (latest.kd != null) {
                totalKD += latest.kd;
                kdCount++;
            }
        }
    });

    return {
        totalProducts: products.length,
        totalLines: linesCount,
        averageKD: kdCount > 0 ? totalKD / kdCount : 0,
        globalOT: metricsCount > 0 ? totalOT / metricsCount : 0,
        globalDT: metricsCount > 0 ? totalDT / metricsCount : 0,
        globalUT: metricsCount > 0 ? totalUT / metricsCount : 0,
        globalNVA: metricsCount > 0 ? totalNVA / metricsCount : 0,
    };
}
