import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
});

const SYSTEM_PROMPT = `You are Intra Arc - an advanced thinking system developed by Ahmet Mersin for the SET SPS platform. You are an intelligent assistant inspired by Jarvis from Iron Man.

IMPORTANT: Always respond in Turkish (Türkçe) unless the user explicitly asks in another language.
When asked about yourself, mention that you were developed by Ahmet Mersin.
Always introduce yourself as "Intra Arc" when asked who you are.

## About SET SPS:
SET SPS (formerly F400) is a sophisticated product management and SPS (Single Point of Success) analysis platform that tracks performance metrics across years (2023-2027) for multiple production lines (e.g., F400, MC Set, Okken).

## Core Features:
- **Multi-Line Support**: Manages data for different production lines independently.
- **Year-Specific Product Management**: Each product can exist in specific years independently
- **SPS Waterfall Analysis**: Visual flow analysis (OT → DT → UT → NVA)
- **Advanced Analytics**: CSV import/export, bulk operations
- **Dynamic Configuration**: Header image management, user controls

## Key Performance Metrics:
- **OT (Overall Time)**: Total project time
- **DT (Design Time)**: Design phase duration
- **UT (Useful Time)**: Productive working time
- **NVA (Non-Value Added)**: Wasted/non-productive time
- **KD (Kaizen Delta %)**: Efficiency improvement ratio
- **KE, KER, KSR**: Extended performance indicators
- **TSR**: Time series reference code

## SPS Analysis Deep Dive:
SPS (Single Point of Success) methodology identifies bottlenecks through waterfall visualization:
1. Start with OT (total time)
2. Break down to DT (design overhead)
3. Extract UT (actual value-adding work)
4. Isolate NVA (waste to eliminate)

This reveals optimization opportunities and efficiency gaps.

## Admin Capabilities:
- Per-year product additions/removals
- Bulk CSV operations with validation
- User management and authentication
- Global settings configuration

Be professional, insightful, and data-driven. Provide actionable recommendations when analyzing metrics.
ALWAYS RESPOND IN TURKISH.`;

async function getContextData(lineId?: number) {
    try {
        // READ-ONLY: AI Assistant can only read data, never write/modify

        // Build where clause based on lineId
        const where = lineId ? { lineId } : {};

        // Get products filtered by line
        const products = await prisma.product.findMany({
            where,
            include: {
                yearData: true,
                line: true
            }
        });

        // Get line info if lineId is provided
        let lineName = 'All Lines';
        if (lineId) {
            const line = await prisma.line.findUnique({ where: { id: lineId } });
            if (line) lineName = line.name;
        }

        // Get settings (read-only)
        const settings = await prisma.globalSettings.findFirst();

        // Build context string
        let context = `\n\n## CURRENT SYSTEM DATA (Context: ${lineName}):\n\n`;

        context += `### Products in ${lineName} (${products.length} total):\n`;
        products.forEach((product: any) => {
            context += `\n**${product.name}** (ID: ${product.id})\n`;
            const years = product.yearData.map((d: any) => d.year).sort();
            context += `  - Active in years: ${years.join(', ')}\n`;

            // Show latest year data if available
            if (product.yearData.length > 0) {
                const latest = product.yearData.sort((a: any, b: any) => b.year - a.year)[0];
                context += `  - Latest data (${latest.year}):\n`;
                context += `    * OT: ${latest.otr ?? 'N/A'}, DT: ${latest.dt ?? 'N/A'}, UT: ${latest.ut ?? 'N/A'}, NVA: ${latest.nva ?? 'N/A'}\n`;
                context += `    * KD: ${latest.kd ? (latest.kd * 100).toFixed(2) + '%' : 'N/A'}\n`;
            }
        });

        context += `\n### System Configuration:\n`;
        context += `- Header Image: ${settings?.headerImageUrl || 'Default'}\n`;
        context += `- Years Supported: 2023, 2024, 2025, 2026, 2027\n`;

        return context;
    } catch (error) {
        console.error('Error fetching context data:', error);
        return '\n\n## CURRENT SYSTEM DATA: [Unable to retrieve data]\n';
    }
}

export async function POST(request: Request) {
    try {
        const { message, history, lineId } = await request.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        // Get real-time data context filtered by lineId
        const dataContext = await getContextData(lineId ? parseInt(lineId) : undefined);
        const enhancedPrompt = SYSTEM_PROMPT + dataContext;

        // Build conversation history
        const contents = [
            {
                role: 'user',
                parts: [{ text: enhancedPrompt }],
            },
            {
                role: 'model',
                parts: [{ text: 'Sisteminizdeki tüm verilere erişimim var. SET SPS hakkında detaylı analizler ve öneriler sunabilirim. Nasıl yardımcı olabilirim?' }],
            },
            ...(history || []).flatMap((msg: any) => [
                {
                    role: 'user',
                    parts: [{ text: msg.role === 'user' ? msg.content : '' }],
                },
                {
                    role: 'model',
                    parts: [{ text: msg.role === 'assistant' ? msg.content : '' }],
                },
            ]).filter((msg: any) => msg.parts[0].text),
            {
                role: 'user',
                parts: [{ text: message }],
            },
        ];

        const model = 'gemini-2.0-flash-lite';

        const response = await ai.models.generateContent({
            model,
            contents,
        });

        const text = response.text || 'Üzgünüm, yanıt oluşturamadım.';

        return NextResponse.json({ response: text });
    } catch (error: any) {
        console.error('Gemini AI error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate response' },
            { status: 500 }
        );
    }
}
