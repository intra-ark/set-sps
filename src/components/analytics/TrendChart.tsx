"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendPoint } from '@/lib/analytics';

interface TrendChartProps {
    data: TrendPoint[];
    title: string;
    dataKey?: string;
    color?: string;
    yAxisLabel?: string;
}

export default function TrendChart({
    data,
    title,
    dataKey = 'value',
    color = '#3dcd58',
    yAxisLabel = 'Value'
}: TrendChartProps) {
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
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis
                        dataKey="year"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                        label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
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
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={3}
                        dot={{ fill: color, r: 5 }}
                        activeDot={{ r: 7 }}
                        name={yAxisLabel}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
