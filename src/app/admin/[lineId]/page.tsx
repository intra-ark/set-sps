"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Line {
    id: number;
    name: string;
    slug: string;
    headerImageUrl: string | null;
}

export default function AdminLinePage() {
    const params = useParams();
    const lineId = params.lineId;
    const [line, setLine] = useState<Line | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState('');
    const [updating, setUpdating] = useState(false);
    const [imageSettingsOpen, setImageSettingsOpen] = useState(false);

    useEffect(() => {
        if (lineId) {
            fetch('/api/lines')
                .then(res => res.json())
                .then((data: Line[]) => {
                    const found = data.find(l => l.id === parseInt(lineId as string));
                    setLine(found || null);
                    if (found?.headerImageUrl) {
                        setImageUrl(found.headerImageUrl);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [lineId]);

    const handleImageUpdate = async () => {
        if (!line || !imageUrl.trim()) return;

        setUpdating(true);
        try {
            const response = await fetch(`/api/lines/${line.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ headerImageUrl: imageUrl.trim() })
            });

            if (response.ok) {
                const updated = await response.json();
                setLine(updated);
                alert('Header image updated successfully!');
            } else {
                alert('Failed to update header image');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating header image');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!line) return <div className="p-8 text-center">Line not found</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{line.name} Management</h1>
                    <p className="text-gray-500">Select a year to manage data</p>
                </div>
                <Link href="/admin" className="text-primary hover:underline font-medium">
                    &larr; Back to Lines
                </Link>
            </header>

            {/* Year Selection Grid */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Year Data Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[2023, 2024, 2025, 2026, 2027].map(year => (
                        <Link key={year} href={`/admin/${lineId}/${year}`} className="block group">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-4xl font-bold text-gray-800 dark:text-white">{year}</span>
                                    <span className="material-icons-outlined text-4xl text-primary group-hover:scale-110 transition-transform">calendar_today</span>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Manage Data &rarr;</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Header Image Update Section - Collapsible */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                    onClick={() => setImageSettingsOpen(!imageSettingsOpen)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <span className="material-icons-outlined text-primary text-2xl">image</span>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Header Image Settings</h2>
                    </div>
                    <span className={`material-icons-outlined text-gray-600 dark:text-gray-400 transition-transform ${imageSettingsOpen ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </button>

                {imageSettingsOpen && (
                    <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Image URL
                                </label>
                                <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="/path/to/image.png or https://..."
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                />
                            </div>
                            {imageUrl && (
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                                    <img
                                        src={imageUrl}
                                        alt="Header Preview"
                                        className="max-h-32 rounded border border-gray-300 dark:border-gray-600"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                </div>
                            )}
                            <button
                                onClick={handleImageUpdate}
                                disabled={updating || !imageUrl.trim()}
                                className="px-6 py-2 bg-primary hover:bg-green-600 text-white font-bold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {updating ? 'Updating...' : 'Update Header Image'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
