"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimeBreakdown } from '@/lib/analytics';

interface TimeBreakdownChartProps {
    data: TimeBreakdown[];
    title: string;
}

export default function TimeBreakdownChart({ data, title }: TimeBreakdownChartProps) {
    if (data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{title}</h3>
                <p className="text-gray-500 text-center py-8">No data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis
                        dataKey="year"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                        label={{ value: 'Time (minutes)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        formatter={(value: number) => [`${value.toFixed(2)} min`, '']}
                    />
                    <Legend />
                    <Bar
                        dataKey="dt"
                        stackId="a"
                        fill="#3b82f6"
                        name="Cycle Time (DT)"
                        radius={[0, 0, 0, 0]}
                    />
                    <Bar
                        dataKey="ut"
                        stackId="a"
                        fill="#10b981"
                        name="Uptime (UT)"
                        radius={[0, 0, 0, 0]}
                    />
                    <Bar
                        dataKey="nva"
                        stackId="a"
                        fill="#ef4444"
                        name="Non-Value Added (NVA)"
                        radius={[8, 8, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>

            {/* Legend explanation */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">DT: Cycle Time</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">UT: Uptime</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">NVA: Waste Time</span>
                </div>
            </div>
        </div>
    );
}
