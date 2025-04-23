import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import ClientOnlyWrapper from "@/components/ClientOnlyWrapper";

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
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <header className="mb-8">
            <nav className="flex justify-between items-center">
              <a href="/" className="text-2xl font-bold text-white hover:text-purple-400 transition-colors">
                Flux<span className="text-purple-500">AI</span>
              </a>
              
              <div className="flex space-x-4">
                <a href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </a>
                <a href="https://github.com/rockyandtom" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                  GitHub
                </a>
              </div>
            </nav>
          </header>
          
          <main>
            <ClientOnlyWrapper>
              {children}
            </ClientOnlyWrapper>
          </main>
          
          <footer className="mt-16 py-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} FluxAI. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Built with Next.js and RunningHub API
            </p>
          </footer>
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
