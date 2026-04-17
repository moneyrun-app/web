import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/components/providers/QueryProvider";
import ThemeInit from "@/components/providers/ThemeInit";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "머니런 — AI 돈 관리 코치",
  description: "AI가 매일 잔소리해주는 돈 관리 코치",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">{`try{if(localStorage.getItem('moneyrun_theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`}</Script>
        <SessionProvider>
          <QueryProvider>
            <ThemeInit />
            {children}
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
