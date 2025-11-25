"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Toast from '@/components/Toast';
import Modal from '@/components/Modal';

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
    const [showYearModal, setShowYearModal] = useState(false);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [newYearInput, setNewYearInput] = useState('');

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
        message: '',
        type: 'success',
        visible: false
    });

    // Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'info' | 'warning' | 'danger';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { }
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type, visible: true });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'info' | 'warning' | 'danger' = 'warning') => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            type,
            onConfirm: () => {
                onConfirm();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

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

    const fetchYears = async () => {
        try {
            const res = await fetch('/api/settings/years');
            if (res.ok) {
                const data = await res.json();
                setAvailableYears(data);
            }
        } catch (error) {
            console.error('Failed to fetch years:', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showBackupMenu && !(event.target as Element).closest('.backup-menu-container')) {
                setShowBackupMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showBackupMenu]);

    useEffect(() => {
        fetchLines();
        if (isAdmin) {
            fetchYears();
        }
    }, [isAdmin]);

    const handleAddYear = async () => {
        const year = parseInt(newYearInput);
        if (!year || isNaN(year)) return;

        try {
            const res = await fetch('/api/settings/years', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year })
            });

            if (res.ok) {
                const updated = await res.json();
                setAvailableYears(updated);
                setNewYearInput('');
                showToast('Year added successfully!');
            } else {
                const error = await res.json();
                showToast(error.error || 'Failed to add year', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error adding year', 'error');
        }
    };

    const handleDeleteYear = async (year: number) => {
        showConfirm(
            'Delete Year',
            `Are you sure you want to delete year ${year}? This will NOT delete the data associated with it, but it will hide it from selection.`,
            async () => {
                try {
                    const res = await fetch('/api/settings/years', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ year })
                    });

                    if (res.ok) {
                        const updated = await res.json();
                        setAvailableYears(updated);
                        showToast(`Year ${year} deleted successfully`);
                    } else {
                        showToast('Failed to delete year', 'error');
                    }
                } catch (error) {
                    console.error(error);
                    showToast('Error deleting year', 'error');
                }
            },
            'warning'
        );
    };

    const handleCreateLine = async () => {
        if (!newLineName.trim() || !newLineSlug.trim()) {
            showToast('Please enter both name and slug', 'error');
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
                showToast('Line created successfully!');
            } else {
                const error = await response.json();
                showToast(`Failed to create line: ${error.error}`, 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error creating line', 'error');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteLine = async (lineId: number, lineName: string) => {
        showConfirm(
            'Delete Line',
            `Are you sure you want to delete "${lineName}"? This will also delete all associated products and data.`,
            async () => {
                try {
                    const response = await fetch(`/api/lines/${lineId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        showToast(`Line "${lineName}" deleted successfully!`, 'success');
                        fetchLines(); // Refresh lines list
                    } else {
                        showToast('Failed to delete line', 'error');
                    }
                } catch (error) {
                    console.error(error);
                    showToast('Error deleting line', 'error');
                }
            },
            'danger'
        );
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

            showToast('Backup exported successfully!');
        } catch (error) {
            console.error(error);
            showToast('Failed to export backup', 'error');
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

            showToast('Excel exported successfully!');
        } catch (error) {
            console.error(error);
            showToast('Failed to export Excel', 'error');
        }
    };

    const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        showConfirm(
            'Import Backup',
            '⚠️ This will replace ALL current data (except users). Are you sure you want to continue?',
            async () => {
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
                    showToast(`Backup imported successfully! Lines: ${result.importedCounts.lines}, Products: ${result.importedCounts.products}`, 'success');

                    // Refresh the page to show updated data
                    setTimeout(() => window.location.reload(), 2000);
                } catch (error) {
                    console.error(error);
                    showToast(`Failed to import backup: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
                } finally {
                    e.target.value = '';
                }
            },
            'danger'
        );
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    // Filter lines based on assignment
    const assignedLines = isAdmin ? lines : lines.filter(l => l.isAssigned);
    const unassignedLines = isAdmin ? [] : lines.filter(l => !l.isAssigned);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {toast.visible && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(prev => ({ ...prev, visible: false }))}
                />
            )}

            <Modal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />

            {/* Schneider Electric Branding Header */}
            <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-[#3dcd58] rounded-lg flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">SE</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        Schneider Electric
                    </h1>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Production Management System</p>
            </div>

            <header className="flex justify-between items-center mb-8 border-b-2 border-[#3dcd58] pb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h2>
                <div className="flex gap-4 items-center">
                    {/* Database Management - Minimal Button */}
                    {isAdmin && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowYearModal(true)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Manage Years"
                            >
                                <span className="material-icons-outlined text-gray-600 dark:text-gray-400">calendar_today</span>
                            </button>

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

            {/* Year Management Modal */}
            {showYearModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Manage Years</h3>
                            <button
                                onClick={() => setShowYearModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Add New Year
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    value={newYearInput}
                                    onChange={(e) => setNewYearInput(e.target.value)}
                                    placeholder="e.g. 2028"
                                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <button
                                    onClick={handleAddYear}
                                    disabled={!newYearInput}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Available Years</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {availableYears.map(year => (
                                    <div key={year} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <span className="font-semibold text-gray-800 dark:text-white">{year}</span>
                                        <button
                                            onClick={() => handleDeleteYear(year)}
                                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                            title="Delete Year"
                                        >
                                            <span className="material-icons-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                ))}
                                {availableYears.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">No years configured.</p>
                                )}
                            </div>
                        </div>
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
