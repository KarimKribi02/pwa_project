import type { Metadata, Viewport } from "next";
import { Noto_Serif, Inter, Work_Sans } from "next/font/google";
import "./globals.css";

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
};

export const viewport: Viewport = {
  themeColor: "#396632",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${notoSerif.variable} ${inter.variable} ${workSans.variable}`}>
      <body className="antialiased bg-surface text-on-surface min-h-screen flex flex-col font-sans selection:bg-primary/20">
        {/* Glassmorphism Header */}
        <header className="glass-nav border-b border-outline/5 py-6 px-8 md:px-16 flex justify-between items-center transition-all duration-300">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 bg-secondary rounded-[0.5rem] flex items-center justify-center text-surface shadow-xl shadow-secondary/20 group-hover:rotate-6 transition-transform">
              <span className="font-serif text-3xl">M</span>
            </div>
            <span className="font-serif text-2xl md:text-3xl tracking-tighter hidden sm:block">Menuiserie Digitale</span>
          </div>
          
          <nav className="flex items-center gap-12 font-work text-sm uppercase tracking-[0.1em] font-medium">
            <a href="/catalog" className="hover:text-primary transition-colors">Atelier</a>
            <a href="/process" className="hover:text-primary transition-colors">Process</a>
            <a href="/contact" className="hover:text-primary transition-colors">Contact</a>
            
            <button id="pwa-install-btn" className="btn-primary py-2 px-6 text-xs shadow-none">
              Install App
            </button>
          </nav>
        </header>

        <main className="flex-1">
          {children}
        </main>

        {/* Editorial Footer */}
        <footer className="bg-surface-low text-on-surface py-24 px-8 md:px-16 mt-24 border-t border-outline/10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
            <div>
              <p className="font-serif text-4xl mb-6">Menuiserie Digitale Marrakesh.</p>
              <p className="text-stone-500 font-work text-sm uppercase tracking-widest italic font-light">© 2024 Menuiserie Digitale Marrakesh. Handcrafted Excellence.</p>
            </div>
            <div className="flex gap-12 font-work text-xs uppercase tracking-widest text-stone-400">
              <a href="#" className="hover:text-primary">About the Atelier</a>
              <a href="#" className="hover:text-primary">Sustainability</a>
              <a href="#" className="hover:text-primary">Terms</a>
              <a href="#" className="hover:text-primary">Contact</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}



