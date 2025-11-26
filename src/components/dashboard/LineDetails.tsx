import React, { useState, useEffect } from 'react';
import WaterfallChart from '../WaterfallChart';
import { Product, formatNumber, formatKDPercent, Line } from '@/lib/utils';

interface LineDetailsProps {
    line: Line | undefined;
    products: Product[];
    onBack: () => void;
}

export default function LineDetails({ line, products, onBack }: LineDetailsProps) {
    const [selectedProducts, setSelectedProducts] = useState<{ [key: string]: string }>({
        '2023': '',
        '2024': '',
        '2025': '',
        '2026': '',
        '2027': '',
    });
    const [selectedYear, setSelectedYear] = useState('2023');
    const [headerImage, setHeaderImage] = useState('/schneider_f400_diagram.png');

    // Initialize defaults when products change
    useEffect(() => {
        if (products.length > 0) {
            const defaults: { [key: string]: string } = {};

            // 2023: Prefer 'NL GL6-1250A', otherwise first available
            const p2023 = products.find(p => p.name === 'NL GL6-1250A') || products.find(p => p.yearData.some(d => d.year === 2023));
            if (p2023) defaults['2023'] = p2023.id.toString();

            // 2024: Prefer 'NL GL6-1250A', otherwise first available
            const p2024 = products.find(p => p.name === 'NL GL6-1250A') || products.find(p => p.yearData.some(d => d.year === 2024));
            if (p2024) defaults['2024'] = p2024.id.toString();

            // 2025-2027: First available
            [2025, 2026, 2027].forEach(year => {
                const p = products.find(p => p.yearData.some(d => d.year === year));
                if (p) defaults[year.toString()] = p.id.toString();
            });

            setSelectedProducts(prev => ({ ...prev, ...defaults }));
        }
    }, [products]);

    // Update header image when line changes
    useEffect(() => {
        if (line) {
            setHeaderImage(line.headerImageUrl || 'https://placehold.co/2816x1536/F5F5F5/3DCD58?text=NO+IMAGE+UPLOADED');
        }
    }, [line]);

    const handleProductChange = (year: string, productId: string) => {
        setSelectedProducts(prev => ({ ...prev, [year]: productId }));
    };

    const getProductData = (year: string) => {
        const productId = selectedProducts[year];
        if (!productId) return null;
        const product = products.find(p => p.id.toString() === productId);
        if (!product) return null;
        return product.yearData.find(d => d.year === parseInt(year));
    };

    const formatPercentInput = (num: number | null | undefined) => {
        if (num == null) return '';
        return (num * 100).toLocaleString('tr-TR', { maximumFractionDigits: 2 });
    };

    return (
        <div className="animate-fade-in">
            <button
                onClick={onBack}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-medium"
            >
                <span className="material-icons-outlined">arrow_back</span>
                Back to Lines List
            </button>

            {/* 1. BÜYÜK GÖRSEL ALANI */}
            <div className="relative mb-4 md:mb-8 rounded-lg liquid-glass shadow-xl p-2 md:p-4 border border-white/80 w-full lg:w-8/12 mx-auto">
                <div className="image-placeholder-inner rounded-lg overflow-hidden flex justify-center items-center">
                    <img src={headerImage}
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/2816x1536/F5F5F5/3DCD58?text=CUBICLE+MODEL+VISUALISATION'; }}
                        alt="Technical Diagram" className="w-full h-full object-cover p-0" />
                </div>
            </div>

            {/* 2. VERİ PANELLERİ VE WATERFALL */}
            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
                {/* 2.1. SINGLE YEAR DATA PANEL */}
                <main className="liquid-glass rounded-lg border border-white/80 shadow-xl overflow-hidden">
                    {/* Year Selector */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {['2023', '2024', '2025', '2026', '2027'].map(year => (
                                <button
                                    key={year}
                                    onClick={() => setSelectedYear(year)}
                                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${selectedYear === year
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Data for Selected Year */}
                    <div className="p-6">
                        <div className="space-y-3">
                            {/* Product Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cubicle Types:
                                </label>
                                <select
                                    value={selectedProducts[selectedYear] || ''}
                                    onChange={(e) => handleProductChange(selectedYear, e.target.value)}
                                    className="w-full bg-primary/10 border border-primary/20 text-center rounded-lg px-4 py-3 font-semibold text-gray-800 dark:text-white transition"
                                >
                                    <option value="" disabled>Ürün Seçiniz...</option>
                                    {products.filter(p => p.yearData.some(d => d.year === parseInt(selectedYear))).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Data Rows */}
                            {(() => {
                                const data = getProductData(selectedYear);
                                return (
                                    <>
                                        <div className="bg-white/50 dark:bg-black/20 rounded-lg px-4 py-3 flex justify-between items-center">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Design Time (DT):</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{formatNumber(data?.dt)}</span>
                                        </div>
                                        <div className="bg-white/50 dark:bg-black/20 rounded-lg px-4 py-3 flex justify-between items-center">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Useful Time (UT):</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{formatNumber(data?.ut)}</span>
                                        </div>
                                        <div className="bg-white/50 dark:bg-black/20 rounded-lg px-4 py-3 flex justify-between items-center">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Non-Value Added:</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{formatNumber(data?.nva)}</span>
                                        </div>
                                        <div className="bg-white/50 dark:bg-black/20 rounded-lg px-4 py-3 flex justify-between items-center">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">KD (%):</span>
                                            <span className="font-bold text-primary text-lg">{formatKDPercent(data?.kd)}</span>
                                        </div>
                                        <div className="bg-white/50 dark:bg-black/20 rounded-lg px-4 py-3 flex justify-between items-center">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">KE:</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{formatKDPercent(data?.ke)}</span>
                                        </div>
                                        <div className="bg-white/50 dark:bg-black/20 rounded-lg px-4 py-3 flex justify-between items-center">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">KER:</span>
                                            <span className="font-bold text-red-600">% {formatPercentInput(data?.ker)}</span>
                                        </div>
                                        <div className="bg-white/50 dark:bg-black/20 rounded-lg px-4 py-3 flex justify-between items-center">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">KSR:</span>
                                            <span className="font-bold text-gray-900 dark:text-white">% {formatPercentInput(data?.ksr)}</span>
                                        </div>
                                        <div className="bg-white/50 dark:bg-black/20 rounded-lg px-4 py-3 flex justify-between items-center">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">OT:</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{formatNumber(data?.otr)}</span>
                                        </div>
                                        <div className="bg-white/50 dark:bg-black/20 rounded-lg px-4 py-3 flex justify-between items-center">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">TSR:</span>
                                            <span className="font-bold text-red-500 font-mono">{data?.tsr || '#DIV/0!'}</span>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </main>

                {/* 2.2. WATERFALL CHART - BÜYÜK SAĞ PANEL */}
                <section className="liquid-glass rounded-lg border border-white/80 shadow-xl p-6">
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <span className="material-icons-outlined text-primary">bar_chart</span>
                                SPS Time Analysis ({selectedYear})
                            </h3>
                            <div className="text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-black/20 px-4 py-2 rounded-lg border border-white/50">
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {products.find(p => p.id.toString() === selectedProducts[selectedYear])?.name || 'No Product Selected'}
                                </span>
                            </div>
                        </div>

                        {/* Waterfall Chart - Full Height */}
                        <div className="flex-1 bg-white/40 dark:bg-black/20 rounded-xl p-6 border border-white/50 min-h-[600px]">
                            <WaterfallChart
                                ot={getProductData(selectedYear)?.otr ?? null}
                                dt={getProductData(selectedYear)?.dt ?? null}
                                ut={getProductData(selectedYear)?.ut ?? null}
                                nva={getProductData(selectedYear)?.nva ?? null}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
