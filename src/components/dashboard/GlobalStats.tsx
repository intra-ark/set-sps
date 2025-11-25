import React, { useMemo } from 'react';
import WaterfallChart from '../WaterfallChart';
import { Product, calculateGlobalStats } from '@/lib/utils';

interface GlobalStatsProps {
    products: Product[];
    linesCount: number;
}

export default function GlobalStats({ products, linesCount }: GlobalStatsProps) {
    // Memoize global stats calculation
    const stats = useMemo(() => calculateGlobalStats(products, linesCount), [products, linesCount]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Global Stats Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Global Waterfall Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600"></div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <span className="material-icons-outlined text-primary">bar_chart</span>
                        Manisa Factory SPS Analysis (Average)
                    </h3>
                    <div className="h-64">
                        {stats.totalProducts === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400">No Data Available</div>
                        ) : (
                            <WaterfallChart
                                ot={stats.globalOT}
                                dt={stats.globalDT}
                                ut={stats.globalUT}
                                nva={stats.globalNVA}
                            />
                        )}
                    </div>
                </div>

                {/* 2. Key Metrics Cards */}
                <div className="space-y-6">
                    {/* Total Products Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-blue-100 font-medium">Total Products</h4>
                                <span className="material-icons-outlined text-blue-200 bg-white/10 p-2 rounded-lg">inventory_2</span>
                            </div>
                            <div className="text-4xl font-bold mb-2">{stats.totalProducts}</div>
                            <div className="text-sm text-blue-200">Across {linesCount} Production Lines</div>
                        </div>
                    </div>

                    {/* Average KD Card */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-emerald-100 font-medium">Average Efficiency (KD)</h4>
                                <span className="material-icons-outlined text-emerald-200 bg-white/10 p-2 rounded-lg">trending_up</span>
                            </div>
                            <div className="text-4xl font-bold mb-2">
                                {stats.averageKD > 0 ? `${(stats.averageKD * 100).toFixed(1)}%` : 'N/A'}
                            </div>
                            <div className="text-sm text-emerald-200">Global Performance</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
