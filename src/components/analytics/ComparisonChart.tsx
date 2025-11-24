"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ComparisonChartProps {
    data: Array<{ name: string; value: number; }>;
    title: string;
    color?: string;
    yAxisLabel?: string;
    showRanking?: boolean;
}

export default function ComparisonChart({
    data,
    title,
    color = '#3dcd58',
    yAxisLabel = 'Value',
    showRanking = true
}: ComparisonChartProps) {
    if (data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{title}</h3>
                <p className="text-gray-500 text-center py-8">No data available</p>
            </div>
        );
    }

    // Sort data for ranking
    const sortedData = showRanking
        ? [...data].sort((a, b) => b.value - a.value).slice(0, 10)
        : data;

    // Color gradient from best to worst
    const getBarColor = (index: number) => {
        if (!showRanking) return color;
        const intensity = 1 - (index / sortedData.length) * 0.5;
        return `rgba(61, 205, 88, ${intensity})`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={sortedData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis
                        type="number"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        width={90}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        formatter={(value: number) => [value.toFixed(2), yAxisLabel]}
                    />
                    <Legend />
                    <Bar
                        dataKey="value"
                        name={yAxisLabel}
                        radius={[0, 8, 8, 0]}
                    >
                        {sortedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
