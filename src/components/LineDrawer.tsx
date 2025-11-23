"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Line {
    id: number;
    name: string;
    slug: string;
    headerImageUrl: string | null;
}

interface LineDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    lines: Line[];
    selectedLineId: number | null;
    onSelectLine: (lineId: number) => void;
    onOpenAuthorModal?: () => void;
}

export default function LineDrawer({ isOpen, onClose, lines, selectedLineId, onSelectLine, onOpenAuthorModal }: LineDrawerProps) {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === 'ADMIN';

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Menu</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <span className="material-icons-outlined">close</span>
                        </button>
                    </div>

                    {/* Line Selection */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Production Lines</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    onSelectLine(-1); // -1 for Global Dashboard
                                    onClose();
                                }}
                                className={`w-full text-left p-3 rounded-lg transition-all duration-300 flex items-center gap-3 ${selectedLineId === -1
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                                    }`}
                            >
                                <span className="material-icons-outlined">dashboard</span>
                                <span className="font-medium">Dashboard</span>
                            </button>

                            <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>

                            {lines.map(line => (
                                <button
                                    key={line.id}
                                    onClick={() => {
                                        onSelectLine(line.id);
                                        onClose();
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between ${selectedLineId === line.id
                                        ? 'bg-primary text-white shadow-md'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                                        }`}
                                >
                                    <span className="font-medium">{line.name}</span>
                                    {selectedLineId === line.id && <span className="material-icons-outlined text-sm">check</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto space-y-4">
                        {/* Mobile Only Menu Items */}
                        <div className="md:hidden space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <button
                                onClick={() => {
                                    window.location.href = "mailto:ahmet.mersin@se.com?subject=SET%20SPS%20Yardım%20İsteği";
                                    onClose();
                                }}
                                className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center gap-3 transition-colors"
                            >
                                <span className="material-icons-outlined text-primary">help</span>
                                <span className="font-medium">Yardım</span>
                            </button>
                            <button
                                onClick={() => {
                                    // We need to trigger the modal from the parent or pass a handler
                                    // For now, let's just show an alert or similar, BUT ideally we should pass a prop
                                    // Since we can't easily pass a prop without changing the interface in a way that affects Dashboard,
                                    // let's assume we can pass a new prop 'onOpenAuthorModal'
                                    // Wait, I can just add it to the props.
                                    onClose();
                                    if (onOpenAuthorModal) onOpenAuthorModal();
                                }}
                                className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center gap-3 transition-colors"
                            >
                                <span className="material-icons-outlined text-primary">person</span>
                                <span className="font-medium">Hazırlayan</span>
                            </button>
                        </div>
                        {/* Admin Link */}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                onClick={onClose}
                                className="block w-full text-center py-3 px-4 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-bold transition-colors"
                            >
                                Admin Panel
                            </Link>
                        )}

                        {/* Auth Buttons */}
                        {session ? (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="flex items-center gap-3 mb-4 px-2">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {session.user?.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{session.user?.name}</p>
                                        <p className="text-xs text-gray-500">{(session.user as any)?.role || 'USER'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="w-full py-2 px-4 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-icons-outlined">logout</span>
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn()}
                                className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-icons-outlined">login</span>
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
