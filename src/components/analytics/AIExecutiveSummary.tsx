"use client";

import { useState, useEffect } from 'react';

interface AIExecutiveSummaryProps {
    avgSPS: number;
    avgCycleTime: number;
    avgUptime: number;
    avgNVA: number;
    trendDirection: string;
    trendPercentage: number;
    selectedYear: number;
    onAnalysisUpdate: (analysis: string) => void;
}

export default function AIExecutiveSummary({
    avgSPS,
    avgCycleTime,
    avgUptime,
    avgNVA,
    trendDirection,
    trendPercentage,
    selectedYear,
    onAnalysisUpdate
}: AIExecutiveSummaryProps) {
    const [analysis, setAnalysis] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: `GÖREV: ${selectedYear} yılı üretim verileri için PDF raporunda kullanılacak profesyonel bir yönetici özeti yaz.

                        VERİLER:
                        - Ortalama SPS (Verimlilik): %${avgSPS.toFixed(1)}
                        - Ortalama Çevrim Süresi: ${avgCycleTime.toFixed(1)} dk
                        - Ortalama Uptime: %${avgUptime.toFixed(1)}
                        - Ortalama NVA (Değersiz Zaman): ${avgNVA.toFixed(1)} dk
                        - Trend: ${trendDirection} (%${trendPercentage.toFixed(1)})

                        KURALLAR:
                        1. SADECE analizi yaz. "Harika bir talep", "İşte analiziniz" gibi giriş/çıkış cümleleri KESİNLİKLE KULLANMA.
                        2. Doğrudan konuya gir (Örn: "2027 yılı verileri gösteriyor ki...").
                        3. 3-4 cümle ile sınırla.
                        4. Profesyonel, veriye dayalı ve resmi bir dil kullan.
                        5. Verimlilik, darboğazlar ve iyileştirme fırsatlarına odaklan.`,
                        history: []
                    })
                });

                if (!response.ok) {
                    throw new Error('Analiz alınamadı');
                }

                const data = await response.json();
                const text = data.response;
                setAnalysis(text);
                onAnalysisUpdate(text);
            } catch (err) {
                console.error('AI Analysis Error:', err);
                setError('Analiz oluşturulurken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        // Debounce to prevent too many requests if props change rapidly
        const timeoutId = setTimeout(() => {
            fetchAnalysis();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [avgSPS, avgCycleTime, avgUptime, avgNVA, trendDirection, trendPercentage, selectedYear, onAnalysisUpdate]);

    return (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🤖</span>
                <h3 className="font-bold text-green-800 dark:text-green-100 text-lg">
                    Intra Arc Yönetici Özeti
                </h3>
            </div>

            <div className="min-h-[80px]">
                {loading ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 animate-pulse">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Veriler analiz ediliyor...</span>
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-sm">{error}</p>
                ) : (
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {analysis}
                    </p>
                )}
            </div>
        </div>
    );
}
