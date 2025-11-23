"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Line {
    id: number;
    name: string;
    slug: string;
}

export default function AdminDashboard() {
    const [lines, setLines] = useState<Line[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, []);

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
                <h2 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200">Select Production Line</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {lines.map(line => (
                        <Link key={line.id} href={`/admin/${line.id}`} className="block group">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-2xl font-bold text-gray-800 dark:text-white">{line.name}</span>
                                    <span className="material-icons-outlined text-4xl text-primary group-hover:scale-110 transition-transform">factory</span>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Manage Line &rarr;</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
