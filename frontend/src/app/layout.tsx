import type { Metadata, Viewport } from "next";
import { Noto_Serif, Inter, Work_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const notoSerif = Noto_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-work",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Menuiserie Digitale | The Modern Atelier",
  description: "Artisan menuisier d'exception à Marrakech. L'excellence du bois sur mesure.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logom.png",
    apple: "/logom.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#396632",
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ConnectivityProvider } from "@/components/ConnectivityProvider";
import CacheStatusBadge from "@/components/CacheStatusBadge";
import InstallPrompt from "@/components/InstallPrompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${notoSerif.variable} ${inter.variable} ${workSans.variable}`}>
      <body className="antialiased bg-surface text-on-surface min-h-screen flex flex-col font-sans selection:bg-primary/20">
        <ConnectivityProvider>
          <ScrollToTop />
          <Navbar />
          <div className="fixed bottom-4 left-4 z-40 hidden md:block">
            <CacheStatusBadge />
          </div>
          <InstallPrompt />

          <main className="flex-1">{children}</main>

          <Footer />
        </ConnectivityProvider>
      </body>
    </html>
  );
}

