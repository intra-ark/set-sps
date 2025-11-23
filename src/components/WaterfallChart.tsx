import React from 'react';

interface WaterfallChartProps {
    ot: number | null;
    dt: number | null;
    ut: number | null;
    nva: number | null;
}

const WaterfallChart: React.FC<WaterfallChartProps> = ({ ot, dt, ut, nva }) => {
    // Determine the maximum value for scaling (usually OT, but fallback to DT)
    const maxVal = Math.max(ot || 0, dt || 0, ut || 0) * 1.1; // 10% padding
    if (maxVal === 0) return <div className="h-full flex items-center justify-center text-gray-400 text-xs">No Data</div>;

    const getHeight = (val: number | null) => val ? `${(val / maxVal) * 100}%` : '0%';

    // Calculate intermediate losses
    const loss1 = (ot && dt) ? ot - dt : 0;
    const loss2 = nva || 0;

    // Formatting
    const fmt = (n: number) => Math.round(n).toLocaleString();

    return (
        <div className="w-full h-full p-4 bg-white/50 dark:bg-black/20 rounded-lg flex flex-col">
            <h5 className="text-xs font-bold text-center mb-4 text-gray-600 dark:text-gray-300 uppercase tracking-wider">SPS Time Analysis</h5>
            <div className="flex-1 flex items-end justify-between gap-1 text-[10px] sm:text-xs font-mono relative">

                {/* 1. OT Bar */}
                {ot && (
                    <div className="w-1/5 flex flex-col items-center group relative h-full justify-end">
                        <span className="mb-1 absolute -top-4 text-gray-700 font-bold">{fmt(ot)}</span>
                        <div style={{ height: getHeight(ot) }} className="w-full bg-gray-400 rounded-t-sm relative hover:bg-gray-500 transition-colors">
                            <div className="absolute bottom-1 w-full text-center text-white font-bold drop-shadow-md">OT</div>
                        </div>
                    </div>
                )}

                {/* 2. Loss 1 (OT -> DT) */}
                {ot && dt && loss1 > 0 && (
                    <div className="w-1/5 flex flex-col items-center group relative h-full justify-end">
                        <span className="mb-1 absolute text-red-600 font-bold" style={{ bottom: `calc(${getHeight(dt)} + ${getHeight(loss1)} + 4px)` }}>-{fmt(loss1)}</span>
                        <div style={{ height: getHeight(loss1), marginBottom: getHeight(dt) }} className="w-full bg-red-400/80 rounded-sm relative hover:bg-red-500 transition-colors">
                        </div>
                    </div>
                )}

                {/* 3. DT Bar */}
                {dt && (
                    <div className="w-1/5 flex flex-col items-center group relative h-full justify-end">
                        <span className="mb-1 absolute -top-4 text-blue-700 font-bold">{fmt(dt)}</span>
                        <div style={{ height: getHeight(dt) }} className="w-full bg-blue-500 rounded-t-sm relative hover:bg-blue-600 transition-colors">
                            <div className="absolute bottom-1 w-full text-center text-white font-bold drop-shadow-md">DT</div>
                        </div>
                    </div>
                )}

                {/* 4. Loss 2 (NVA) */}
                {dt && ut && loss2 > 0 && (
                    <div className="w-1/5 flex flex-col items-center group relative h-full justify-end">
                        <span className="mb-1 absolute text-red-600 font-bold" style={{ bottom: `calc(${getHeight(ut)} + ${getHeight(loss2)} + 4px)` }}>-{fmt(loss2)}</span>
                        <div style={{ height: getHeight(loss2), marginBottom: getHeight(ut) }} className="w-full bg-red-500 rounded-sm relative hover:bg-red-600 transition-colors">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/90 font-bold text-[8px] sm:text-[10px]">NVA</div>
                        </div>
                    </div>
                )}

                {/* 5. UT Bar */}
                {ut && (
                    <div className="w-1/5 flex flex-col items-center group relative h-full justify-end">
                        <span className="mb-1 absolute -top-4 text-green-700 font-bold">{fmt(ut)}</span>
                        <div style={{ height: getHeight(ut) }} className="w-full bg-green-500 rounded-t-sm relative hover:bg-green-600 transition-colors">
                            <div className="absolute bottom-1 w-full text-center text-white font-bold drop-shadow-md">UT</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WaterfallChart;
