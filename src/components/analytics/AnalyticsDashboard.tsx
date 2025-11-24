"use client";

import { useState, useMemo } from 'react';
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

interface AnalyticsDashboardProps {
    products: Product[];
}

export default function AnalyticsDashboard({ products }: AnalyticsDashboardProps) {
    // Get available years first to set correct default
    const availableYears = useMemo(() => {
        const years = products.flatMap(p => p.yearData.map(yd => yd.year));
        return [...new Set(years)].sort((a, b) => b - a);
    }, [products]);

    const [selectedYear, setSelectedYear] = useState(availableYears[0] || 2025);
    const [selectedMetric, setSelectedMetric] = useState<keyof YearData>('kd');
    const [isExporting, setIsExporting] = useState(false);

    // Calculate KPIs
    const avgSPS = useMemo(() =>
        calculateAverageByYear(products, 'kd', selectedYear),
        [products, selectedYear]
    );

    const avgCycleTime = useMemo(() =>
        calculateAverageByYear(products, 'dt', selectedYear),
        [products, selectedYear]
    );

    const avgUptime = useMemo(() =>
        calculateAverageByYear(products, 'ut', selectedYear),
        [products, selectedYear]
    );

    const avgNVA = useMemo(() =>
        calculateAverageByYear(products, 'nva', selectedYear),
        [products, selectedYear]
    );

    // Calculate trends
    const spsTrend = useMemo(() => getMetricTrend(products, 'kd'), [products]);
    const cycleTimeTrend = useMemo(() => getMetricTrend(products, 'dt'), [products]);
    const uptimeTrend = useMemo(() => getMetricTrend(products, 'ut'), [products]);
    const nvaTrend = useMemo(() => getMetricTrend(products, 'nva'), [products]);

    // Get top products
    const topProducts = useMemo(() =>
        getTopProducts(products, selectedMetric, selectedYear, 10),
        [products, selectedMetric, selectedYear]
    );

    // Time breakdown
    const timeBreakdown = useMemo(() =>
        getTimeBreakdownTrend(products),
        [products]
    );

    // Export handler
    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            await exportAnalyticsToPDF({
                title: 'Manufacturing Analytics Report',
                subtitle: `Performance Analysis for Year ${selectedYear}`,
                userName: 'System User', // This could come from session
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

    if (products.length === 0) {
        return (
            <div className="p-8">
                <p className="text-center text-gray-500">No data available for analytics</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        📊 Manufacturing Analytics
                    </h2>
                    <div className="flex gap-4">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="kd">SPS (KD)</option>
                            <option value="dt">Cycle Time (DT)</option>
                            <option value="ut">Uptime (UT)</option>
                            <option value="nva">NVA</option>
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
                        key={`${String(selectedMetric)}-${selectedYear}`}
                        data={topProducts}
                        title={`Top 10 Products by ${selectedMetric.toUpperCase()} (${selectedYear})`}
                        yAxisLabel={selectedMetric.toUpperCase()}
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
                    <li>• <strong>NVA (Non-Value Added):</strong> Waste time that doesn't add value to the product</li>
                </ul>
            </div>
        </div>
    );
}
