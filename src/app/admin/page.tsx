"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Line {
    id: number;
    name: string;
    slug: string;
    isAssigned?: boolean;
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [lines, setLines] = useState<Line[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLineName, setNewLineName] = useState('');
    const [newLineSlug, setNewLineSlug] = useState('');
    const [creating, setCreating] = useState(false);
    const [showBackupMenu, setShowBackupMenu] = useState(false);

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

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (showBackupMenu && !(e.target as HTMLElement).closest('.backup-menu-container')) {
                setShowBackupMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showBackupMenu]);

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

    const handleExportBackup = async () => {
        try {
            const response = await fetch('/api/backup/export');
            if (!response.ok) {
                throw new Error('Failed to export backup');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `set-sps-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert('Backup exported successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to export backup');
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await fetch('/api/backup/excel');
            if (!response.ok) {
                throw new Error('Failed to export Excel');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `set-sps-export-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert('Excel exported successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to export Excel');
        }
    };

    const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('⚠️ This will replace ALL current data (except users). Are you sure you want to continue?')) {
            e.target.value = '';
            return;
        }

        try {
            const text = await file.text();
            const backup = JSON.parse(text);

            const response = await fetch('/api/backup/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backup),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || 'Failed to import backup');
            }

            const result = await response.json();
            alert(`Backup imported successfully!\n\nImported:\n- Lines: ${result.importedCounts.lines}\n- Products: ${result.importedCounts.products}\n- Year Data: ${result.importedCounts.yearData}\n- User Lines: ${result.importedCounts.userLines}`);

            // Refresh the page to show updated data
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert(`Failed to import backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            e.target.value = '';
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    // Filter lines based on assignment
    const assignedLines = isAdmin ? lines : lines.filter(l => l.isAssigned);
    const unassignedLines = isAdmin ? [] : lines.filter(l => !l.isAssigned);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
                <div className="flex gap-4 items-center">
                    {/* Database Management - Minimal Button */}
                    {isAdmin && (
                        <div className="relative group backup-menu-container">
                            <button
                                onClick={() => setShowBackupMenu(!showBackupMenu)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Database Management"
                            >
                                <span className="material-icons-outlined text-gray-600 dark:text-gray-400">storage</span>
                            </button>

                            {/* Dropdown Menu */}
                            {showBackupMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Database</p>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => { handleExportBackup(); setShowBackupMenu(false); }}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <span className="material-icons-outlined text-blue-600 text-base">download</span>
                                            <span className="text-gray-700 dark:text-gray-300">Export JSON</span>
                                        </button>
                                        <button
                                            onClick={() => { handleExportExcel(); setShowBackupMenu(false); }}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <span className="material-icons-outlined text-green-600 text-base">table_chart</span>
                                            <span className="text-gray-700 dark:text-gray-300">Export Excel</span>
                                        </button>
                                        <label className="w-full">
                                            <div className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2 text-sm cursor-pointer">
                                                <span className="material-icons-outlined text-orange-600 text-base">upload</span>
                                                <span className="text-gray-700 dark:text-gray-300">Import JSON</span>
                                            </div>
                                            <input
                                                type="file"
                                                accept=".json"
                                                onChange={(e) => { handleImportBackup(e); setShowBackupMenu(false); }}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 px-2">Import replaces all data</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <Link href="/admin/users" className="text-primary hover:underline font-medium">
                        Manage Users
                    </Link>
                    <Link href="/" className="text-primary hover:underline font-medium">
                        Back to Public Site
                    </Link>
                </div>
            </header>

            {/* Assigned Lines Section */}
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
                    {assignedLines.map(line => (
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
                {assignedLines.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        {isAdmin ? 'No lines created yet. Click "Add New Line" to get started.' : 'No lines assigned to you. Please contact an administrator.'}
                    </div>
                )}
            </div>

            {/* Unassigned Lines Section (Only for non-admins) */}
            {!isAdmin && unassignedLines.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
                        Not Assigned Lines
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-75">
                        {unassignedLines.map(line => (
                            <div key={line.id} className="relative group">
                                <Link href={`/admin/${line.id}`} className="block">
                                    <div className="bg-gray-100 dark:bg-gray-900 rounded-xl shadow p-8 border-2 border-transparent hover:border-gray-300 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">{line.name}</span>
                                            <span className="material-icons-outlined text-4xl text-gray-400">lock</span>
                                        </div>
                                        <p className="text-gray-400 dark:text-gray-500 font-medium">View Only &rarr;</p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
