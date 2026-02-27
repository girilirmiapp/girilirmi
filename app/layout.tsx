import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Girilir mi? - AI Destekli SaaS Platformu",
  description: "Yapay zeka ile güçlendirilmiş, veri odaklı yeni nesil SaaS çözümü.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Girilirmi",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark scroll-smooth">
      <body className={`${inter.className} bg-gray-950 text-gray-100 antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Toaster 
          position="top-right" 
          richColors 
          expand={false}
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(17, 24, 39, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              borderRadius: '16px',
            }
          }}
        />
      </body>
    </html>
  );
}
