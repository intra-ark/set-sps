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
    const [selectedChartYear, setSelectedChartYear] = useState('2025');
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

            {/* 2. VERİ PANELLERİ */}
            <main className="liquid-glass rounded-lg border border-white/80 shadow-xl overflow-hidden p-0">
                <div className="scroll-container">
                    <div className="flex">

                        {/* 2.1. SABİT ETİKET SÜTUNU */}
                        <div className="sticky-labels hidden lg:flex w-48 flex-col justify-end space-y-2 py-4 px-3">
                            <div className="text-right font-medium h-10 flex items-center justify-end pr-2 text-text-secondary-light">Cubicle Types:</div>
                            <div className="text-right font-medium h-10 flex items-center justify-end pr-2 text-text-secondary-light">Design Time (DT):</div>
                            <div className="text-right font-medium h-10 flex items-center justify-end pr-2 text-text-secondary-light">Useful Time (UT):</div>
                            <div className="text-right font-medium h-10 flex items-center justify-end pr-2 text-text-secondary-light">Non-Value Added:</div>
                            <div className="text-right font-medium h-10 flex items-center justify-end pr-2 text-text-secondary-light">KD (%):</div>
                            <div className="text-right font-medium h-10 flex items-center justify-end pr-2 text-text-secondary-light">KE:</div>
                            <div className="text-right font-medium h-10 flex items-center justify-end pr-2 text-text-secondary-light">KER:</div>
                            <div className="text-right font-medium h-10 flex items-center justify-end pr-2 text-text-secondary-light">KSR:</div>
                            <div className="text-right font-medium h-10 flex items-center justify-end pr-2 text-text-secondary-light">OT:</div>
                            <div className="text-right font-medium h-10 flex items-center justify-end pr-2 text-text-secondary-light">TSR:</div>
                        </div>

                        {/* 2.2. YILLIK VERİ PANELLERİ */}
                        {['2023', '2024', '2025', '2026', '2027'].map(year => {
                            const data = getProductData(year);
                            return (
                                <div key={year} className="data-panel p-4 border-r border-border-light">
                                    <h4 className="text-lg font-bold text-center mb-3">{year}</h4>
                                    <div className="space-y-2">
                                        <select
                                            value={selectedProducts[year] || ''}
                                            onChange={(e) => handleProductChange(year, e.target.value)}
                                            className="product-select w-full bg-primary/10 border-primary/20 text-center rounded-lg h-10 flex items-center justify-center font-semibold text-text-primary-light p-2 transition text-sm"
                                        >
                                            <option value="" disabled>Ürün Seçiniz...</option>
                                            {products.filter(p => p.yearData.some(d => d.year === parseInt(year))).map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>

                                        <div className="bg-white/50 dark:bg-black/20 data-row">
                                            <span className="lg:hidden">Design Time (DT):</span>
                                            <span className="data-value">{formatNumber(data?.dt)}</span>
                                        </div>
                                        <div className="bg-white/50 dark:bg-black/20 data-row">
                                            <span className="lg:hidden">Useful Time (UT):</span>
                                            <span className="data-value">{formatNumber(data?.ut)}</span>
                                        </div>
                                        <div className="bg-white/50 dark:bg-black/20 data-row">
                                            <span className="lg:hidden">Non-Value Added:</span>
                                            <span className="data-value">{formatNumber(data?.nva)}</span>
                                        </div>
                                        <div className="bg-white/50 dark:bg-black/20 data-row">
                                            <span className="lg:hidden">KD (%):</span>
                                            <span className="data-value text-primary">{formatKDPercent(data?.kd)}</span>
                                        </div>
                                        <div className="bg-white/50 dark:bg-black/20 data-row">
                                            <span className="lg:hidden">KE:</span>
                                            <span className="data-value">{formatKDPercent(data?.ke)}</span>
                                        </div>
                                        <div className="flex items-center h-10 justify-end lg:justify-start">
                                            <span className="lg:hidden mr-2">KER:</span>
                                            <span className="w-1/4 text-center hidden lg:inline">%</span>
                                            <input className="ker-input ker-red" type="text" readOnly value={formatPercentInput(data?.ker)} />
                                        </div>
                                        <div className="flex items-center h-10 justify-end lg:justify-start">
                                            <span className="lg:hidden mr-2">KSR:</span>
                                            <span className="w-1/4 text-center hidden lg:inline">%</span>
                                            <input className="ker-input bg-white/50 dark:bg-black/20 border-border-light text-center" type="text" readOnly value={formatPercentInput(data?.ksr)} />
                                        </div>
                                        <div className="bg-white/50 dark:bg-black/20 data-row">
                                            <span className="lg:hidden">OT:</span>
                                            <span className="data-value">{formatNumber(data?.otr)}</span>
                                        </div>
                                        <div className="bg-white/50 dark:bg-black/20 data-row">
                                            <span className="lg:hidden">TSR:</span>
                                            <span className="data-value text-red-500 font-mono">{data?.tsr || '#DIV/0!'}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                </div>
            </main>

            {/* 3. SPS WATERFALL ANALYSIS SECTION */}
            <section className="mt-8 liquid-glass rounded-lg border border-white/80 shadow-xl p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="material-icons-outlined text-primary">bar_chart</span>
                        SPS Time Analysis (Waterfall)
                    </h3>

                    {/* Year Tabs */}
                    <div className="flex p-1 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-x-auto max-w-full">
                        {['2023', '2024', '2025', '2026', '2027'].map(year => (
                            <button
                                key={year}
                                onClick={() => setSelectedChartYear(year)}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${selectedChartYear === year
                                    ? 'bg-white dark:bg-gray-600 text-primary shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white/40 dark:bg-black/20 rounded-xl p-6 border border-white/50 min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-2xl text-gray-700 dark:text-gray-200">{selectedChartYear} Analysis</h4>
                        <span className="text-sm font-mono text-gray-500 bg-white/50 px-3 py-1 rounded border border-white/50">
                            Product: <span className="font-bold text-gray-800">{products.find(p => p.id.toString() === selectedProducts[selectedChartYear])?.name || 'No Product Selected'}</span>
                        </span>
                    </div>

                    <div className="h-[400px]">
                        <WaterfallChart
                            ot={getProductData(selectedChartYear)?.otr ?? null}
                            dt={getProductData(selectedChartYear)?.dt ?? null}
                            ut={getProductData(selectedChartYear)?.ut ?? null}
                            nva={getProductData(selectedChartYear)?.nva ?? null}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
