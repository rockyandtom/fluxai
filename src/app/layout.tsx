import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import ClientOnlyWrapper from "@/components/ClientOnlyWrapper";
import Link from 'next/link';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FluxAI - AI Image Generator",
  description: "Transform your images with AI-powered effects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      {/* Google Analytics 追踪代码 */}
      <Script async src="https://www.googletagmanager.com/gtag/js?id=G-D1MZFL0J94" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
        
          gtag('config', 'G-D1MZFL0J94');
        `}
      </Script>
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <header className="mb-8">
            <nav className="flex justify-between items-center">
              <Link href="/" className="text-4xl font-bold text-white hover:text-purple-400 transition-colors">
                Flux<span className="text-purple-500">AI</span>
              </Link>
              
              {/* 移除右上角导航链接 */}
            </nav>
          </header>
          
          <main>
            <ClientOnlyWrapper>
              {children}
            </ClientOnlyWrapper>
          </main>
        </div>
        
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'white',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
