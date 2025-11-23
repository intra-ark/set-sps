"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Line {
    id: number;
    name: string;
    slug: string;
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [lines, setLines] = useState<Line[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLineName, setNewLineName] = useState('');
    const [newLineSlug, setNewLineSlug] = useState('');
    const [creating, setCreating] = useState(false);

    const isAdmin = session?.user?.role === 'ADMIN';

    useEffect(() => {
        fetchLines();
    }, []);

    const fetchLines = () => {
        fetch('/api/lines')
            .then(res => res.json())
            .then(data => {
                setLines(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleCreateLine = async () => {
        if (!newLineName.trim() || !newLineSlug.trim()) {
            alert('Please enter both name and slug');
            return;
        }

        setCreating(true);
        try {
            const response = await fetch('/api/lines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newLineName.trim(),
                    slug: newLineSlug.trim()
                })
            });

            if (response.ok) {
                setShowAddModal(false);
                setNewLineName('');
                setNewLineSlug('');
                fetchLines();
            } else {
                const error = await response.json();
                alert(`Failed to create line: ${error.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('Error creating line');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteLine = async (lineId: number, lineName: string) => {
        if (!confirm(`Are you sure you want to delete "${lineName}"? This will also delete all associated products and data.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/lines/${lineId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchLines();
            } else {
                alert('Failed to delete line');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting line');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
                <div className="flex gap-4">
                    <Link href="/admin/users" className="text-primary hover:underline font-medium">
                        Manage Users
                    </Link>
                    <Link href="/" className="text-primary hover:underline font-medium">
                        Back to Public Site
                    </Link>
                </div>
            </header>

            {/* Line Selection Grid */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
                        {isAdmin ? 'Production Lines' : 'Your Assigned Lines'}
                    </h2>
                    {isAdmin && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-primary hover:bg-green-600 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
                        >
                            <span className="material-icons-outlined">add</span>
                            Add New Line
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {lines.map(line => (
                        <div key={line.id} className="relative group">
                            <Link href={`/admin/${line.id}`} className="block">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-2xl font-bold text-gray-800 dark:text-white">{line.name}</span>
                                        <span className="material-icons-outlined text-4xl text-primary group-hover:scale-110 transition-transform">factory</span>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Manage Line &rarr;</p>
                                </div>
                            </Link>
                            {isAdmin && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDeleteLine(line.id, line.name);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete line"
                                >
                                    <span className="material-icons-outlined text-sm">delete</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {lines.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        {isAdmin ? 'No lines created yet. Click "Add New Line" to get started.' : 'No lines assigned to you. Please contact an administrator.'}
                    </div>
                )}
            </div>

            {/* Add Line Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Add New Production Line</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Line Name
                                </label>
                                <input
                                    type="text"
                                    value={newLineName}
                                    onChange={(e) => setNewLineName(e.target.value)}
                                    placeholder="e.g., Assembly Line 1"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Slug (URL-friendly identifier)
                                </label>
                                <input
                                    type="text"
                                    value={newLineSlug}
                                    onChange={(e) => setNewLineSlug(e.target.value)}
                                    placeholder="e.g., assembly-line-1"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleCreateLine}
                                disabled={creating}
                                className="flex-1 px-4 py-2 bg-primary hover:bg-green-600 text-white font-bold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {creating ? 'Creating...' : 'Create Line'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewLineName('');
                                    setNewLineSlug('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
