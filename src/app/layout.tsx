import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SET SPS Manufacturing Time Definition",
    description: "SET SPS Dashboard",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr" className="light">
            <head>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
            </head>
            <body className={`${inter.className} font-display bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark min-h-screen`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
