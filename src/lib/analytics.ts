// Analytics utility functions for data processing and calculations

export interface YearData {
    year: number;
    dt: number | null;
    ut: number | null;
    nva: number | null;
    kd: number | null;
    ke: number | null;
    ker: number | null;
    ksr: number | null;
    otr: number | null;
}

export interface Product {
    id: number;
    name: string;
    lineId: number;
    yearData: YearData[];
}

export interface TrendPoint {
    year: number;
    value: number;
    productName?: string;
}

export interface ComparisonData {
    name: string;
    current: number;
    previous: number;
    change: number;
    changePercent: number;
}

export interface TimeBreakdown {
    year: number;
    dt: number;
    ut: number;
    nva: number;
    total: number;
}

// Calculate SPS trend across years for a product
export function calculateSPSTrend(product: Product): TrendPoint[] {
    return product.yearData
        .filter(yd => yd.kd !== null)
        .map(yd => ({
            year: yd.year,
            value: yd.kd || 0,
            productName: product.name
        }))
        .sort((a, b) => a.year - b.year);
}

// Calculate average metric across all products for a year
export function calculateAverageByYear(products: Product[], metric: keyof YearData, year: number): number {
    const values = products
        .flatMap(p => p.yearData)
        .filter(yd => yd.year === year && yd[metric] !== null)
        .map(yd => yd[metric] as number);

    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
}

// Get trend data for a specific metric across years
export function getMetricTrend(products: Product[], metric: keyof YearData): TrendPoint[] {
    const years = [...new Set(products.flatMap(p => p.yearData.map(yd => yd.year)))].sort();

    return years.map(year => ({
        year,
        value: calculateAverageByYear(products, metric, year)
    }));
}

// Compare year-over-year performance
export function compareYearOverYear(
    products: Product[],
    metric: keyof YearData,
    currentYear: number,
    previousYear: number
): ComparisonData[] {
    return products.map(product => {
        const current = product.yearData.find(yd => yd.year === currentYear)?.[metric] || 0;
        const previous = product.yearData.find(yd => yd.year === previousYear)?.[metric] || 0;

        const currentVal = Number(current);
        const previousVal = Number(previous);
        const change = currentVal - previousVal;
        const changePercent = previousVal !== 0 ? (change / previousVal) * 100 : 0;

        return {
            name: product.name,
            current: currentVal,
            previous: previousVal,
            change,
            changePercent
        };
    }).filter(item => item.current !== 0 || item.previous !== 0);
}

// Get top performing products by metric
export function getTopProducts(
    products: Product[],
    metric: keyof YearData,
    year: number,
    count: number = 10,
    ascending: boolean = false
): Array<{ name: string; value: number }> {
    const productValues = products
        .map(product => {
            const yearData = product.yearData.find(yd => yd.year === year);
            const value = yearData?.[metric];
            return {
                name: product.name,
                value: typeof value === 'number' ? value : 0
            };
        })
        .filter(item => item.value !== 0);

    productValues.sort((a, b) => ascending ? a.value - b.value : b.value - a.value);

    return productValues.slice(0, count);
}

// Calculate time breakdown for manufacturing analysis
export function calculateTimeBreakdown(products: Product[], year: number): TimeBreakdown {
    const yearDataList = products
        .flatMap(p => p.yearData)
        .filter(yd => yd.year === year);

    if (yearDataList.length === 0) {
        return { year, dt: 0, ut: 0, nva: 0, total: 0 };
    }

    const avgDT = yearDataList.reduce((sum, yd) => sum + (yd.dt || 0), 0) / yearDataList.length;
    const avgUT = yearDataList.reduce((sum, yd) => sum + (yd.ut || 0), 0) / yearDataList.length;
    const avgNVA = yearDataList.reduce((sum, yd) => sum + (yd.nva || 0), 0) / yearDataList.length;

    return {
        year,
        dt: avgDT,
        ut: avgUT,
        nva: avgNVA,
        total: avgDT + avgUT + avgNVA
    };
}

// Get all time breakdowns across years
export function getTimeBreakdownTrend(products: Product[]): TimeBreakdown[] {
    const years = [...new Set(products.flatMap(p => p.yearData.map(yd => yd.year)))].sort();
    return years.map(year => calculateTimeBreakdown(products, year));
}

// Calculate efficiency metrics for radar chart
export interface EfficiencyMetrics {
    productName: string;
    KD: number;
    KE: number;
    KER: number;
    KSR: number;
    OTR: number;
}

export function getEfficiencyMetrics(product: Product, year: number): EfficiencyMetrics | null {
    const yearData = product.yearData.find(yd => yd.year === year);
    if (!yearData) return null;

    return {
        productName: product.name,
        KD: yearData.kd || 0,
        KE: yearData.ke || 0,
        KER: yearData.ker || 0,
        KSR: yearData.ksr || 0,
        OTR: yearData.otr || 0
    };
}

// Format percentage for display
export function formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
}

// Format change with + or - sign
export function formatChange(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}`;
}

// Get color based on performance (green for good, red for bad)
export function getPerformanceColor(value: number, threshold: number, reverse: boolean = false): string {
    const isGood = reverse ? value < threshold : value > threshold;
    return isGood ? '#3dcd58' : '#ef4444';
}
