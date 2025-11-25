"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import WaterfallChart from './WaterfallChart';
import AIAssistant from './AIAssistant';
import LineDrawer from './LineDrawer';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
import { findStarProduct, formatKDPercent, calculateGlobalStats, type StarProduct, type Line, type Product } from '@/lib/utils';
import GlobalStats from './dashboard/GlobalStats';
import LineGrid from './dashboard/LineGrid';
import LineDetails from './dashboard/LineDetails';

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

export default function Dashboard() {

    const [products, setProducts] = useState<Product[]>([]);
    const [modalOpen, setModalOpen] = useState(false);

    // Multi-line support
    const [lines, setLines] = useState<Line[]>([]);
    const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'lines' | 'analytics'>('overview');

    const handleLineSelect = useCallback((lineId: number, shouldSwitchTab: boolean = true) => {
        setSelectedLineId(lineId);
        setLoading(true);

        // Strict Navigation Logic
        if (shouldSwitchTab) {
            if (lineId !== -1) {
                // If selecting a specific line, show details in Lines tab
                setActiveTab('lines');
            } else {
                // If selecting global view, show Overview tab
                setActiveTab('overview');
            }
        }

        if (lineId === -1) {
            // Global Dashboard
            fetch('/api/products')
                .then(res => res.json())
                .then((data: Product[]) => {
                    setProducts(data);
                    setLoading(false);
                });
        } else {
            // Fetch products for selected line
            fetch(`/api/products?lineId=${lineId}`)
                .then(res => res.json())
                .then((data: Product[]) => {
                    setProducts(data);
                    setLoading(false);
                });
        }
    }, [lines, activeTab]);

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

    return (
        <div className="p-2 sm:p-4 lg:p-8 max-w-[1800px] mx-auto" id="app">
            {loading && (
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

            {/* Tab Navigation */}
            <div className="mb-6 flex gap-3">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'overview'
                        ? 'bg-gradient-to-r from-primary to-green-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md'
                        }`}
                >
                    <span className="material-icons-outlined text-xl">dashboard</span>
                    <span>Overview</span>
                </button>

                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'analytics'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-600 hover:shadow-md'
                        }`}
                >
                    <span className="material-icons-outlined text-xl">analytics</span>
                    <span>Analytics</span>
                </button>

                <button
                    onClick={() => setActiveTab('lines')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'lines'
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-500 hover:shadow-md'
                        }`}
                >
                    <span className="material-icons-outlined text-xl">factory</span>
                    <span>Lines</span>
                </button>
            </div>

            {/* Conditional Rendering based on active tab */}
            {activeTab === 'analytics' ? (
                <AnalyticsDashboard products={products} initialLineId={selectedLineId !== -1 ? selectedLineId : null} />
            ) : activeTab === 'lines' ? (
                <div className="space-y-6 animate-fade-in">
                    {selectedLineId === -1 ? (
                        /* Production Lines Grid */
                        <LineGrid
                            lines={lines}
                            products={products}
                            onSelectLine={handleLineSelect}
                        />
                    ) : (
                        /* Line Details View */
                        <LineDetails
                            line={lines.find(l => l.id === selectedLineId)}
                            products={products}
                            onBack={() => handleLineSelect(-1, false)}
                        />
                    )}
                </div>
            ) : ( // This is the 'overview' tab content - ALWAYS SHOW GLOBAL STATS
                <GlobalStats products={products} linesCount={lines.length} />
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
    );
}
