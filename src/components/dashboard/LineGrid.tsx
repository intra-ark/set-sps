import React from 'react';
import { Line, Product, findStarProduct } from '@/lib/utils';

interface LineGridProps {
    lines: Line[];
    products: Product[];
    onSelectLine: (id: number) => void;
}

export default function LineGrid({ lines, products, onSelectLine }: LineGridProps) {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <span className="material-icons-outlined text-3xl text-orange-500">factory</span>
                Production Lines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lines.map(line => {
                    const lineProducts = products.filter(p => p.lineId === line.id);
                    const totalProducts = lineProducts.length;

                    // Find Star Product (Best KD) using utility
                    const bestProduct = findStarProduct(lineProducts);

                    return (
                        <div key={line.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group" onClick={() => onSelectLine(line.id)}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-primary transition-colors">{line.name}</h3>
                                        {bestProduct && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold border border-yellow-200 dark:border-yellow-700/50 animate-fade-in ml-2" title={`Best Performance: ${(bestProduct.kd * 100).toFixed(1)}%`}>
                                                <span className="material-icons-outlined text-[14px]">star</span>
                                                <span className="truncate max-w-[100px]">{bestProduct.name}</span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Production Line</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0 ml-2">
                                    <span className="material-icons-outlined">factory</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-2">
                                <div>
                                    <span className="text-3xl font-bold text-gray-800 dark:text-white">{totalProducts}</span>
                                    <span className="text-xs text-gray-500 ml-1 uppercase font-semibold">Products</span>
                                </div>
                                <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    View Details <span className="material-icons-outlined text-sm">arrow_forward</span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
