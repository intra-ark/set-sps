"use client";

import { useState, useMemo, useEffect } from 'react';
import AIExecutiveSummary from './AIExecutiveSummary';
import TrendChart from './TrendChart';
import ComparisonChart from './ComparisonChart';
import TimeBreakdownChart from './TimeBreakdownChart';
import KPICard from './KPICard';
import {
    getMetricTrend,
    getTopProducts,
    getTimeBreakdownTrend,
    calculateAverageByYear,
    Product
} from '@/lib/analytics';
import { exportAnalyticsToPDF } from '@/lib/pdfExport';

interface Line {
    id: number;
    name: string;
    slug: string;
}

interface AnalyticsDashboardProps {
    products: Product[];
    initialLineId?: number | null;
}

export default function AnalyticsDashboard({ products, initialLineId }: AnalyticsDashboardProps) {
    const [lines, setLines] = useState<Line[]>([]);
    const [selectedLineId, setSelectedLineId] = useState<number | null>(initialLineId ?? null); // null means "All Lines"
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null); // null means "All Products"

    // Fetch available lines
    useEffect(() => {
        fetch('/api/lines')
            .then(res => res.json())
            .then((data: Line[]) => {
                if (Array.isArray(data)) {
                    setLines(data);
                }
            })
            .catch(err => console.error('Error fetching lines:', err));
    }, []);

    // Filter products by selected line
    const lineFilteredProducts = useMemo(() => {
        if (selectedLineId === null) {
            return products; // Show all products
        }
        return products.filter(p => p.lineId === selectedLineId);
    }, [products, selectedLineId]);

    // Get available products for the product selector (based on line filter)
    const availableProducts = useMemo(() => {
        return lineFilteredProducts;
    }, [lineFilteredProducts]);

    // Final filtered products (by line AND product)
    const filteredProducts = useMemo(() => {
        if (selectedProductId === null) {
            return lineFilteredProducts; // Show all products in selected line
        }
        return lineFilteredProducts.filter(p => p.id === selectedProductId);
    }, [lineFilteredProducts, selectedProductId]);

    // Reset product selection when line changes
    useEffect(() => {
        setSelectedProductId(null);
    }, [selectedLineId]);

    // Get available years first to set correct default
    const availableYears = useMemo(() => {
        const years = filteredProducts.flatMap(p => p.yearData.map(yd => yd.year));
        return [...new Set(years)].sort((a, b) => b - a);
    }, [filteredProducts]);

    const [selectedYear, setSelectedYear] = useState(availableYears[0] || 2025);
    const [isExporting, setIsExporting] = useState(false);
    // const [aiAnalysisText, setAiAnalysisText] = useState<string>("");

    // Calculate KPIs
    const avgSPS = useMemo(() =>
        calculateAverageByYear(filteredProducts, 'kd', selectedYear),
        [filteredProducts, selectedYear]
    );

    const avgCycleTime = useMemo(() =>
        calculateAverageByYear(filteredProducts, 'dt', selectedYear),
        [filteredProducts, selectedYear]
    );

    const avgUptime = useMemo(() =>
        calculateAverageByYear(filteredProducts, 'ut', selectedYear),
        [filteredProducts, selectedYear]
    );

    const avgNVA = useMemo(() =>
        calculateAverageByYear(filteredProducts, 'nva', selectedYear),
        [filteredProducts, selectedYear]
    );

    // Calculate trends
    const spsTrend = useMemo(() => getMetricTrend(filteredProducts, 'kd'), [filteredProducts]);
    const cycleTimeTrend = useMemo(() => getMetricTrend(filteredProducts, 'dt'), [filteredProducts]);
    const uptimeTrend = useMemo(() => getMetricTrend(filteredProducts, 'ut'), [filteredProducts]);
    const nvaTrend = useMemo(() => getMetricTrend(filteredProducts, 'nva'), [filteredProducts]);

    // Calculate trend direction for AI
    const { trendDirection, trendPercentage } = useMemo(() => {
        const sortedTrend = [...spsTrend].sort((a, b) => a.year - b.year);
        let direction = 'Stabil';
        let percentage = 0;

        if (sortedTrend.length >= 2) {
            const first = sortedTrend[0].value;
            const last = sortedTrend[sortedTrend.length - 1].value;
            if (first !== 0) {
                percentage = ((last - first) / first) * 100;
                direction = percentage > 0 ? 'Artışta' : percentage < 0 ? 'Düşüşte' : 'Stabil';
            }
        }
        return { trendDirection: direction, trendPercentage: percentage };
    }, [spsTrend]);

    // Get top products by SPS
    const topProducts = useMemo(() =>
        getTopProducts(filteredProducts, 'kd', selectedYear, 10),
        [filteredProducts, selectedYear]
    );

    // Time breakdown
    const timeBreakdown = useMemo(() =>
        getTimeBreakdownTrend(filteredProducts),
        [filteredProducts]
    );

    // Export handler
    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            // 2. Generate PDF
            await exportAnalyticsToPDF({
                title: 'Manufacturing Analytics Report',
                subtitle: `Performance Analysis for Year ${selectedYear}`,
                userName: 'System User',
                selectedYear,
                avgSPS,
                avgCycleTime,
                avgUptime,
                avgNVA
            });
        } catch (error) {
            console.error('PDF Export failed:', error);
            alert('Failed to export PDF. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    if (filteredProducts.length === 0) {
        return (
            <div className="p-8">
                <p className="text-center text-gray-500">
                    {selectedLineId === null
                        ? 'No data available for analytics'
                        : `No data available for ${lines.find(l => l.id === selectedLineId)?.name || 'selected line'}`
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            📊 Manufacturing Analytics
                            {selectedLineId !== null && (
                                <span className="ml-3 text-lg font-normal text-primary">
                                    • {lines.find(l => l.id === selectedLineId)?.name || 'Unknown Line'}
                                </span>
                            )}
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={selectedLineId ?? ''}
                            onChange={(e) => setSelectedLineId(e.target.value ? Number(e.target.value) : null)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium shadow-sm hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                            <option value="">🌍 All Lines</option>
                            {lines.map(line => (
                                <option key={line.id} value={line.id}>🏭 {line.name}</option>
                            ))}
                        </select>
                        <select
                            value={selectedProductId ?? ''}
                            onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : null)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium shadow-sm hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            disabled={availableProducts.length === 0}
                        >
                            <option value="">📦 All Products</option>
                            {availableProducts.map(product => (
                                <option key={product.id} value={product.id}>🔧 {product.name}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium shadow-sm hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>📅 {year}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-6 py-2 bg-[#3dcd58] hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <span>📄</span>
                                    Export PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* AI Executive Summary */}
                <AIExecutiveSummary
                    avgSPS={avgSPS}
                    avgCycleTime={avgCycleTime}
                    avgUptime={avgUptime}
                    avgNVA={avgNVA}
                    trendDirection={trendDirection}
                    trendPercentage={trendPercentage}
                    selectedYear={selectedYear}
                    onAnalysisUpdate={() => { }} // No-op since we don't store it
                />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Average SPS"
                    value={avgSPS}
                    unit="%"
                    target={85}
                    icon="🎯"
                    color="#3dcd58"
                />
                <KPICard
                    title="Cycle Time"
                    value={avgCycleTime}
                    unit="min"
                    target={45}
                    icon="⏱️"
                    color="#3b82f6"
                />
                <KPICard
                    title="Uptime"
                    value={avgUptime}
                    unit="%"
                    target={90}
                    icon="⚡"
                    color="#10b981"
                />
                <KPICard
                    title="NVA Time"
                    value={avgNVA}
                    unit="min"
                    target={10}
                    icon="⚠️"
                    color="#ef4444"
                />
            </div>

            {/* Trend Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div id="trend-sps">
                    <TrendChart
                        data={spsTrend}
                        title="SPS Trend Over Years"
                        yAxisLabel="SPS (%)"
                        color="#3dcd58"
                    />
                </div>
                <div id="trend-cycletime">
                    <TrendChart
                        data={cycleTimeTrend}
                        title="Cycle Time Trend"
                        yAxisLabel="Minutes"
                        color="#3b82f6"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendChart
                    data={uptimeTrend}
                    title="Uptime Trend"
                    yAxisLabel="Uptime (%)"
                    color="#10b981"
                />
                <TrendChart
                    data={nvaTrend}
                    title="Non-Value Added Time Trend"
                    yAxisLabel="Minutes"
                    color="#ef4444"
                />
            </div>

            {/* Comparison and Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div id="comparison-chart">
                    <ComparisonChart
                        key={`sps-${selectedYear}`}
                        data={topProducts}
                        title={`Top 10 Products by SPS (${selectedYear})`}
                        yAxisLabel="SPS (%)"
                        showRanking={true}
                    />
                </div>
                <div id="time-breakdown">
                    <TimeBreakdownChart
                        data={timeBreakdown}
                        title="Manufacturing Time Breakdown"
                    />
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">📈 Analytics Insights</h3>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li>• <strong>SPS (Standardized Production System):</strong> Overall manufacturing efficiency metric</li>
                    <li>• <strong>Cycle Time (DT):</strong> Time required to complete one production cycle</li>
                    <li>• <strong>Uptime (UT):</strong> Percentage of time machines are operational</li>
                    <li>• <strong>NVA (Non-Value Added):</strong> Waste time that doesn&apos;t add value to the product</li>
                </ul>
            </div>
        </div>
    );
}
