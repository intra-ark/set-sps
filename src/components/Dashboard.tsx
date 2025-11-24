"use client";

import { useState, useEffect, useCallback } from 'react';
import WaterfallChart from './WaterfallChart';
import AIAssistant from './AIAssistant';
import LineDrawer from './LineDrawer';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';

interface YearData {
    id: number;
    year: number;
    dt: number | null;
    ut: number | null;
    nva: number | null;
    kd: number | null;
    ke: number | null;
    ker: number | null;
    ksr: number | null;
    otr: number | null;
    tsr: string | null;
}

interface Product {
    id: number;
    name: string;
    image: string | null;
    lineId: number;
    yearData: YearData[];
}

interface Line {
    id: number;
    name: string;
    slug: string;
    headerImageUrl: string | null;
}

interface StarProduct {
    name: string;
    kd: number;
}

export default function Dashboard() {

    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<{ [key: string]: string }>({
        '2023': '',
        '2024': '',
        '2025': '',
        '2026': '',
        '2027': '',
    });
    const [modalOpen, setModalOpen] = useState(false);

    const [headerImage, setHeaderImage] = useState('/schneider_f400_diagram.png');
    const [selectedChartYear, setSelectedChartYear] = useState('2025');

    // Multi-line support
    const [lines, setLines] = useState<Line[]>([]);
    const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState<'classic' | 'analytics'>('classic');

    const handleLineSelect = useCallback((lineId: number) => {
        setSelectedLineId(lineId);
        setLoading(true);

        if (lineId === -1) {
            // Global Dashboard
            setHeaderImage('/schneider_f400_diagram.png'); // Default or specific global image
            fetch('/api/products')
                .then(res => res.json())
                .then((data: Product[]) => {
                    setProducts(data);
                    // For global view, we might want to show summary cards instead of product details
                    // But for now, let's just reset selected products to avoid confusion
                    setSelectedProducts({});
                    setLoading(false);
                    setDataLoaded(true);
                });
        } else {
            const line = lines.find(l => l.id === lineId);
            if (line) {
                // Don't use default - use actual URL or placeholder
                setHeaderImage(line.headerImageUrl || 'https://placehold.co/2816x1536/F5F5F5/3DCD58?text=NO+IMAGE+UPLOADED');
            }

            // Fetch products for selected line
            fetch(`/api/products?lineId=${lineId}`)
                .then(res => res.json())
                .then((data: Product[]) => {
                    setProducts(data);

                    const defaults: { [key: string]: string } = {};

                    // 2023: Prefer 'NL GL6-1250A', otherwise first available
                    const p2023 = data.find(p => p.name === 'NL GL6-1250A') || data.find(p => p.yearData.some(d => d.year === 2023));
                    if (p2023) defaults['2023'] = p2023.id.toString();

                    // 2024-2027: First available
                    [2024, 2025, 2026, 2027].forEach(year => {
                        const p = data.find(p => p.yearData.some(d => d.year === year));
                        if (p) defaults[year.toString()] = p.id.toString();
                    });

                    setSelectedProducts(prev => ({ ...prev, ...defaults }));
                    setLoading(false);
                    setDataLoaded(true);
                });
        }
    }, [lines]);

    useEffect(() => {
        // Fetch lines
        fetch('/api/lines')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch lines');
                }
                return res.json();
            })
            .then((data: Line[]) => {
                if (Array.isArray(data)) {
                    setLines(data);
                } else {
                    console.error('Unexpected response for lines:', data);
                    setLines([]);
                }
                // Default to Global Dashboard (-1)
                // We can't call handleLineSelect here directly if it depends on lines which we just set
                // But handleLineSelect uses 'lines' state.
                // Actually, for the initial load, we just want to load global data (-1).
                // Global data (-1) logic doesn't depend on 'lines' state for fetching products.
                // So we can extract the logic or just call it.
                // However, handleLineSelect is now a dependency.
            })
            .catch(err => {
                console.error('Error fetching lines:', err);
                setLines([]);
            });
    }, []);

    // Trigger initial selection after lines are loaded or on mount
    useEffect(() => {
        if (selectedLineId === null) {
            handleLineSelect(-1);
        }
    }, [handleLineSelect, selectedLineId]);

    // Auto-refresh when window regains focus (e.g., switching from admin panel)
    useEffect(() => {
        const handleFocus = () => {
            // Re-fetch lines and products
            fetch('/api/lines')
                .then(res => res.json())
                .then((data: Line[]) => {
                    if (Array.isArray(data)) {
                        setLines(data);
                        // Re-select current line to refresh products
                        if (selectedLineId !== null) {
                            handleLineSelect(selectedLineId);
                        }
                    }
                })
                .catch(err => console.error('Error refreshing lines:', err));
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [selectedLineId, handleLineSelect]);

    // ... (rest of component)



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

    const formatNumber = (num: number | null) => {
        if (num === null || num === undefined) return '--';
        return num.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
    };

    const formatPercent = (num: number | null) => {
        if (num === null || num === undefined) return '--';
        return (num * 100).toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + '%';
    };

    const formatPercentInput = (num: number | null) => {
        if (num === null || num === undefined) return '';
        return (num * 100).toLocaleString('tr-TR', { maximumFractionDigits: 2 });
    };

    return (
        <div className="p-2 sm:p-4 lg:p-8 max-w-[1800px] mx-auto" id="app">
            {loading && !dataLoaded && (
                <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary mb-4"></div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Loading Dashboard...</h2>
                        <p className="text-gray-500 dark:text-gray-400">Please wait while we fetch your data</p>
                    </div>
                </div>
            )}

            <LineDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                lines={lines}
                selectedLineId={selectedLineId}
                onSelectLine={handleLineSelect}
                onOpenAuthorModal={() => setModalOpen(true)}
            />

            {/* HEADER */}
            {/* HEADER */}
            {/* HEADER */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 md:gap-0">
                {/* Left Side: Logo */}
                <div className="flex-1 flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-primary">Schneider</h2>
                        <p className="text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark">Electric</p>
                    </div>
                    <div className="text-2xl md:text-3xl font-light text-gray-400">|</div>
                    <h2 className="text-2xl md:text-3xl font-bold text-primary">SET SPS</h2>
                </div>

                {/* Center: Title */}
                <div className="flex-1 text-center w-full md:w-auto order-3 md:order-2">
                    <h1 className="text-lg sm:text-2xl font-bold text-text-primary-light dark:text-text-primary-dark tracking-wide">
                        {Array.isArray(lines) ? (lines.find(l => l.id === selectedLineId)?.name.toUpperCase() || 'MANUFACTURING') : 'MANUFACTURING'} TIME DEFINITION
                    </h1>
                </div>

                {/* Right Side: Buttons (Help, Author, Menu) */}
                <div className="flex-1 flex justify-end gap-3 w-full md:w-auto order-2 md:order-3 absolute top-4 right-4 md:static">
                    <button onClick={() => window.location.href = "/docs"}
                        className="hidden md:flex bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 text-sm items-center gap-1">
                        <span className="material-icons-outlined text-base">help</span>
                        <span>Yardım</span>
                    </button>
                    <button onClick={() => setModalOpen(true)}
                        className="hidden md:flex bg-primary hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                        <span>Hazırlayan</span>
                    </button>
                    {/* Menu Button */}
                    <button onClick={() => setDrawerOpen(true)}
                        className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex items-center gap-2">
                        <span className="material-icons-outlined">menu</span>
                        <span className="hidden sm:inline">Menu</span>
                    </button>
                </div>
            </header>

            {/* Enhanced Tab Navigation */}
            <div className="mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 relative overflow-hidden">
                    {/* Gradient Background Accent */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600"></div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('classic')}
                            className={`flex-1 relative group overflow-hidden rounded-xl transition-all duration-300 ${activeTab === 'classic'
                                    ? 'bg-gradient-to-r from-primary to-green-600 text-white shadow-lg scale-[1.02]'
                                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-[1.01]'
                                }`}
                        >
                            <div className="relative z-10 px-8 py-4 flex items-center justify-center gap-3">
                                <span className="material-icons-outlined text-2xl">
                                    {activeTab === 'classic' ? 'dashboard' : 'dashboard_customize'}
                                </span>
                                <div className="text-left">
                                    <div className="font-bold text-lg">Classic View</div>
                                    <div className={`text-xs ${activeTab === 'classic' ? 'text-white/80' : 'text-gray-500'}`}>
                                        Production Overview
                                    </div>
                                </div>
                            </div>
                            {activeTab === 'classic' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`flex-1 relative group overflow-hidden rounded-xl transition-all duration-300 ${activeTab === 'analytics'
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-[1.02]'
                                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-[1.01]'
                                }`}
                        >
                            <div className="relative z-10 px-8 py-4 flex items-center justify-center gap-3">
                                <span className="material-icons-outlined text-2xl">
                                    {activeTab === 'analytics' ? 'analytics' : 'bar_chart'}
                                </span>
                                <div className="text-left">
                                    <div className="font-bold text-lg">Analytics Dashboard</div>
                                    <div className={`text-xs ${activeTab === 'analytics' ? 'text-white/80' : 'text-gray-500'}`}>
                                        Advanced Insights
                                    </div>
                                </div>
                            </div>
                            {activeTab === 'analytics' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Conditional Rendering based on active tab */}
            {activeTab === 'analytics' ? (
                <AnalyticsDashboard products={products} />
            ) : (
                <div>

                    {selectedLineId === -1 ? (
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
                                        {(() => {
                                            // Calculate global averages based on latest year data for each product
                                            let totalOT = 0, totalDT = 0, totalUT = 0, totalNVA = 0;
                                            let count = 0;

                                            products.forEach(p => {
                                                if (p.yearData.length > 0) {
                                                    // Get latest year data
                                                    const latest = [...p.yearData].sort((a, b) => b.year - a.year)[0];
                                                    if (latest.otr && latest.dt && latest.ut && latest.nva) {
                                                        totalOT += latest.otr;
                                                        totalDT += latest.dt;
                                                        totalUT += latest.ut;
                                                        totalNVA += latest.nva;
                                                        count++;
                                                    }
                                                }
                                            });

                                            if (count === 0) return <div className="h-full flex items-center justify-center text-gray-400">No Data Available</div>;

                                            return (
                                                <WaterfallChart
                                                    ot={totalOT / count}
                                                    dt={totalDT / count}
                                                    ut={totalUT / count}
                                                    nva={totalNVA / count}
                                                />
                                            );
                                        })()}
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
                                            <div className="text-4xl font-bold mb-2">{products.length}</div>
                                            <div className="text-sm text-blue-200">Across {lines.length} Production Lines</div>
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
                                                {(() => {
                                                    let totalKD = 0;
                                                    let count = 0;
                                                    products.forEach(p => {
                                                        const latest = [...p.yearData].sort((a, b) => b.year - a.year)[0];
                                                        if (latest && latest.kd) {
                                                            totalKD += latest.kd;
                                                            count++;
                                                        }
                                                    });
                                                    return count > 0 ? `${((totalKD / count) * 100).toFixed(1)}%` : 'N/A';
                                                })()}
                                            </div>
                                            <div className="text-sm text-emerald-200">Global Performance</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Line Cards Grid */}
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-8 mb-4 border-l-4 border-primary pl-3">Production Lines</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {lines.map(line => {
                                    const lineProducts = products.filter(p => p.lineId === line.id);
                                    const totalProducts = lineProducts.length;

                                    // Find Star Product (Best KD)
                                    let starProduct: StarProduct | null = null;

                                    lineProducts.forEach(p => {
                                        const latest = [...p.yearData].sort((a, b) => b.year - a.year)[0];
                                        if (latest && latest.kd) {
                                            if (!starProduct || latest.kd > starProduct.kd) {
                                                starProduct = { name: p.name, kd: latest.kd };
                                            }
                                        }
                                    });

                                    // Extract to const for proper type narrowing
                                    const bestProduct = starProduct;

                                    return (
                                        <div key={line.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group" onClick={() => handleLineSelect(line.id)}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-4 flex-wrap">
                                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-primary transition-colors">{line.name}</h3>
                                                        {bestProduct && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold border border-yellow-200 dark:border-yellow-700/50 animate-fade-in ml-2" title={`Best Performance: ${((bestProduct as StarProduct).kd * 100).toFixed(1)}%`}>
                                                                <span className="material-icons-outlined text-[14px]">star</span>
                                                                <span className="truncate max-w-[100px]">{(bestProduct as StarProduct).name}</span>
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
                    ) : (
                        <>
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
                                                            <span className="data-value">{formatNumber(data?.dt ?? null)}</span>
                                                        </div>
                                                        <div className="bg-white/50 dark:bg-black/20 data-row">
                                                            <span className="lg:hidden">Useful Time (UT):</span>
                                                            <span className="data-value">{formatNumber(data?.ut ?? null)}</span>
                                                        </div>
                                                        <div className="bg-white/50 dark:bg-black/20 data-row">
                                                            <span className="lg:hidden">Non-Value Added:</span>
                                                            <span className="data-value">{formatNumber(data?.nva ?? null)}</span>
                                                        </div>
                                                        <div className="bg-white/50 dark:bg-black/20 data-row">
                                                            <span className="lg:hidden">KD (%):</span>
                                                            <span className="data-value text-primary">{formatPercent(data?.kd ?? null)}</span>
                                                        </div>
                                                        <div className="bg-white/50 dark:bg-black/20 data-row">
                                                            <span className="lg:hidden">KE:</span>
                                                            <span className="data-value">{formatPercent(data?.ke ?? null)}</span>
                                                        </div>
                                                        <div className="flex items-center h-10 justify-end lg:justify-start">
                                                            <span className="lg:hidden mr-2">KER:</span>
                                                            <span className="w-1/4 text-center hidden lg:inline">%</span>
                                                            <input className="ker-input ker-red" type="text" readOnly value={formatPercentInput(data?.ker ?? null)} />
                                                        </div>
                                                        <div className="flex items-center h-10 justify-end lg:justify-start">
                                                            <span className="lg:hidden mr-2">KSR:</span>
                                                            <span className="w-1/4 text-center hidden lg:inline">%</span>
                                                            <input className="ker-input bg-white/50 dark:bg-black/20 border-border-light text-center" type="text" readOnly value={formatPercentInput(data?.ksr ?? null)} />
                                                        </div>
                                                        <div className="bg-white/50 dark:bg-black/20 data-row">
                                                            <span className="lg:hidden">OT:</span>
                                                            <span className="data-value">{formatNumber(data?.otr ?? null)}</span>
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
                        </>
                    )}

                    {/* Popup Modal */}
                    <div className={`modal fixed inset-0 z-50 flex items-center justify-center p-4 ${modalOpen ? 'active' : ''}`}>
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>
                        <div className="modal-content liquid-glass bg-white/95 rounded-2xl shadow-2xl w-full max-w-sm relative overflow-hidden z-10 border border-white/80">
                            <div className="bg-primary h-20 w-full absolute top-0 left-0"></div>
                            <button onClick={() => setModalOpen(false)} className="absolute top-3 right-3 text-white/90 hover:text-white transition-colors z-20">
                                <span className="material-icons-outlined">close</span>
                            </button>
                            <div className="pt-12 px-6 pb-6 text-center relative">
                                <div className="w-20 h-20 mx-auto bg-white rounded-full p-1 shadow-md mb-3 flex items-center justify-center relative z-10 border-4 border-primary">
                                    <span className="material-icons-outlined text-4xl text-primary">person</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Ahmet Mersin</h3>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-6 font-semibold">Proje Yöneticisi</p>
                                <a href="mailto:ahmet.mersin@se.com" className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg border border-gray-200 transition-colors mb-3 group text-sm">
                                    <span className="material-icons-outlined text-gray-500 group-hover:text-primary text-base">mail_outline</span>
                                    ahmet.mersin@se.com
                                </a>
                                <button onClick={() => setModalOpen(false)} className="w-full py-2.5 bg-primary hover:bg-green-600 text-white font-bold rounded-lg shadow-md transition-all text-sm">
                                    Kapat
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* AI Assistant Widget */}
                    <AIAssistant />
                </div>
            )}
        </div>
    );
}
