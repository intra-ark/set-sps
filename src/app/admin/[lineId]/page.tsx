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
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [availableYears, setAvailableYears] = useState<number[]>([]);

    useEffect(() => {
        if (lineId) {
            // Fetch line data
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

            // Fetch available years
            fetch('/api/settings/years')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setAvailableYears(data);
                    }
                })
                .catch(err => console.error('Failed to fetch years:', err));
        }
    }, [lineId]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImageUrl(previewUrl);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !line) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                const error = await uploadResponse.json();
                alert(`Upload failed: ${error.error}`);
                return;
            }

            const { url } = await uploadResponse.json();

            // Update line with new image URL
            const response = await fetch(`/api/lines/${line.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ headerImageUrl: url })
            });

            if (response.ok) {
                const updated = await response.json();
                setLine(updated);
                setImageUrl(url);
                setSelectedFile(null);
                alert('Header image uploaded successfully!');
            } else {
                alert('Failed to update header image');
            }
        } catch (error) {
            console.error(error);
            alert('Error uploading image');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async () => {
        if (!line) return;
        if (!confirm('Are you sure you want to remove the header image?')) return;

        setUpdating(true);
        try {
            const response = await fetch(`/api/lines/${line.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ headerImageUrl: null })
            });

            if (response.ok) {
                const updated = await response.json();
                setLine(updated);
                setImageUrl('');
                setSelectedFile(null);
                alert('Header image removed successfully!');
            } else {
                alert('Failed to remove header image');
            }
        } catch (error) {
            console.error(error);
            alert('Error removing header image');
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
                    {availableYears.length > 0 ? (
                        availableYears.map(year => (
                            <Link key={year} href={`/admin/${lineId}/${year}`} className="block group">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-4xl font-bold text-primary">{year}</span>
                                        <span className="material-icons-outlined text-gray-400 group-hover:text-primary transition-colors text-3xl">
                                            calendar_today
                                        </span>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400">Manage products and SPS data for {year}</p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-3 text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <p className="text-gray-500">No years configured. Please ask an admin to add years in the Admin Dashboard.</p>
                        </div>
                    )}
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
                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Upload Header Image
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className="flex-1 cursor-pointer">
                                        <div className="px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary dark:hover:border-primary transition-colors text-center">
                                            <span className="material-icons-outlined text-gray-400 text-3xl mb-2">cloud_upload</span>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {selectedFile ? selectedFile.name : 'Click to select image'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                    </label>
                                    {selectedFile && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">{selectedFile.name}</span>
                                            <button
                                                onClick={handleUpload}
                                                disabled={uploading}
                                                className="bg-primary hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                            >
                                                {uploading ? 'Uploading...' : 'Save Image'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Preview */}
                            {imageUrl && (
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                                    <img
                                        src={imageUrl}
                                        alt="Header Preview"
                                        className="max-h-48 rounded border border-gray-300 dark:border-gray-600"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading || !selectedFile}
                                    className="flex-1 px-6 py-2 bg-primary hover:bg-green-600 text-white font-bold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-icons-outlined text-sm">upload</span>
                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                </button>
                                {line?.headerImageUrl && (
                                    <button
                                        onClick={handleRemoveImage}
                                        disabled={updating}
                                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-icons-outlined text-sm">delete</span>
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
