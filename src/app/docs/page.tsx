"use client";

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DocSection {
    title: string;
    items: { title: string; file: string; description: string }[];
}

const docSections: DocSection[] = [
    {
        title: "Başlangıç",
        items: [
            { title: "Sisteme Giriş", file: "01-giris", description: "SPS Analiz Sistemi nedir, temel kavramlar" },
            { title: "Hızlı Başlangıç", file: "02-hizli-baslangic", description: "İlk adımlar ve temel kullanım" },
        ]
    },
    {
        title: "Kullanıcı Kılavuzları",
        items: [
            { title: "Admin Kullanıcı Kılavuzu", file: "04-admin-kilavuzu", description: "Admin özellikleri ve kullanımı" },
            { title: "Normal Kullanıcı Kılavuzu", file: "05-kullanici-kilavuzu", description: "Kullanıcı özellikleri ve kullanımı" },
        ]
    },
    {
        title: "Sistem Mimarisi",
        items: [
            { title: "Genel Mimari", file: "07-mimari", description: "Sistem mimarisi ve teknolojiler" },
            { title: "Veritabanı Şeması", file: "08-veritabani", description: "Database yapısı ve ilişkiler" },
            { title: "Rol Bazlı Yetkilendirme", file: "09-yetkiler", description: "İzin sistemi ve roller" },
        ]
    },
    {
        title: "API Dokümantasyonu",
        items: [
            { title: "API Genel Bakış", file: "10-api-genel", description: "API kullanımı ve endpoint'ler" },
            { title: "Hat (Line) API", file: "12-api-lines", description: "Hat yönetimi API'leri" },
            { title: "Kullanıcı API", file: "13-api-users", description: "Kullanıcı yönetimi API'leri" },
            { title: "Kullanıcı-Hat Atama API", file: "16-api-user-lines", description: "Hat atama API'leri" },
        ]
    },
    {
        title: "Özellikler",
        items: [
            { title: "Hat Yönetimi", file: "17-hat-yonetimi", description: "Hat ekleme, düzenleme, silme" },
            { title: "Kullanıcı-Hat Ataması", file: "18-kullanici-hat-atama", description: "Kullanıcılara hat atama sistemi" },
        ]
    }
];

export default function DocsPage() {
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [docContent, setDocContent] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const loadDoc = async (file: string) => {
        setLoading(true);
        setSelectedDoc(file);

        try {
            const response = await fetch(`/api/docs?file=${file}`);
            const text = await response.text();
            setDocContent(text);
        } catch (error) {
            console.error('Error loading doc:', error);
            setDocContent("# Hata\n\nDokümantasyon yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-icons-outlined text-primary text-3xl">menu_book</span>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                SPS Analiz Sistemi - Dokümantasyon
                            </h1>
                        </div>
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                            <span className="material-icons-outlined text-sm">home</span>
                            Ana Sayfa
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                İçindekiler
                            </h2>
                            <nav className="space-y-6">
                                {docSections.map((section, idx) => (
                                    <div key={idx}>
                                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            {section.title}
                                        </h3>
                                        <ul className="space-y-1">
                                            {section.items.map((item, itemIdx) => (
                                                <li key={itemIdx}>
                                                    <button
                                                        onClick={() => loadDoc(item.file)}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedDoc === item.file
                                                            ? 'bg-primary text-white'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                            }`}
                                                    >
                                                        {item.title}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        {!selectedDoc ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                                <div className="text-center py-12">
                                    <span className="material-icons-outlined text-6xl text-gray-400 mb-4">description</span>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Hoş Geldiniz!
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                                        Sol menüden bir konu seçerek dokümantasyonu incelemeye başlayın.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                        <button
                                            onClick={() => loadDoc('01-giris')}
                                            className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl hover:shadow-lg transition-all"
                                        >
                                            <span className="material-icons-outlined text-4xl text-blue-600 dark:text-blue-400 mb-2">rocket_launch</span>
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Başlangıç</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Sisteme giriş ve temel kavramlar</p>
                                        </button>
                                        <button
                                            onClick={() => loadDoc('10-api-genel')}
                                            className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl hover:shadow-lg transition-all"
                                        >
                                            <span className="material-icons-outlined text-4xl text-green-600 dark:text-green-400 mb-2">api</span>
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">API Dokümantasyonu</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">API kullanımı ve endpoint'ler</p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                        <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-lg dark:prose-invert max-w-none 
                                        prose-headings:text-gray-900 dark:prose-headings:text-white
                                        prose-p:text-gray-700 dark:prose-p:text-gray-300
                                        prose-strong:text-gray-900 dark:prose-strong:text-white
                                        prose-code:text-primary prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                                        prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
                                        prose-a:text-primary hover:prose-a:text-green-600
                                        prose-table:border prose-table:border-gray-300 dark:prose-table:border-gray-700
                                        prose-th:bg-gray-100 dark:prose-th:bg-gray-800
                                        prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {docContent}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
