"use client";

interface KPICardProps {
    title: string;
    value: number | string;
    unit?: string;
    trend?: number;
    target?: number;
    icon?: string;
    color?: string;
}

export default function KPICard({
    title,
    value,
    unit = '',
    trend,
    target,
    icon = '📊',
    color = '#3dcd58'
}: KPICardProps) {
    const getTrendIcon = () => {
        if (trend === undefined) return null;
        if (trend > 0) return '↑';
        if (trend < 0) return '↓';
        return '→';
    };

    const getTrendColor = () => {
        if (trend === undefined) return 'text-gray-500';
        if (trend > 0) return 'text-green-500';
        if (trend < 0) return 'text-red-500';
        return 'text-gray-500';
    };

    const achievement = target !== undefined && typeof value === 'number'
        ? (value / target) * 100
        : null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4" style={{ borderColor: color }}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-bold text-gray-800 dark:text-white">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                        </span>
                        {unit && <span className="text-lg text-gray-500">{unit}</span>}
                    </div>
                </div>
                <span className="text-3xl">{icon}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                        <span className="text-xl">{getTrendIcon()}</span>
                        <span className="font-semibold">{Math.abs(trend).toFixed(1)}%</span>
                    </div>
                )}

                {achievement !== null && (
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">vs Target</p>
                        <p className={`font-semibold ${achievement >= 100 ? 'text-green-500' :
                                achievement >= 80 ? 'text-yellow-500' :
                                    'text-red-500'
                            }`}>
                            {achievement.toFixed(0)}%
                        </p>
                    </div>
                )}
            </div>

            {achievement !== null && (
                <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `${Math.min(achievement, 100)}%`,
                                backgroundColor: achievement >= 100 ? '#10b981' :
                                    achievement >= 80 ? '#f59e0b' : '#ef4444'
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
