'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  LogOut, 
  Menu,
  X,
  User,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // If we are on the login page, don't show the sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { name: 'Produits', icon: <Package size={20} />, path: '/admin/products' },
    { name: 'Commandes', icon: <ShoppingCart size={20} />, path: '/admin/orders' },
    { name: 'Facturation', icon: <FileText size={20} />, path: '/admin/billing' },
  ];

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar - Desktop */}
      <aside className="bg-white w-72 border-r border-primary/5 flex-col hidden lg:flex">
        <div className="p-8 border-b border-primary/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <span className="font-serif text-2xl">M</span>
            </div>
            <div>
              <h2 className="font-serif text-lg text-primary leading-none">Atelier</h2>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">Admin Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                pathname === item.path 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-gray-400 hover:bg-primary/5 hover:text-primary"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-primary/5">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-red-50 transition-all w-full"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-primary/5 px-8 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-primary p-2 bg-primary/5 rounded-lg">
            <Menu size={24} />
          </button>

          <h1 className="font-serif text-xl md:text-2xl text-primary hidden md:block">
            {menuItems.find(item => item.path === pathname)?.name || 'Administration'}
          </h1>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-primary">Jean Artisan</p>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Maître Menuisier</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-highest border border-primary/10 flex items-center justify-center text-primary overflow-hidden">
              <User size={24} />
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <motion.aside 
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            className="absolute top-0 left-0 w-72 h-full bg-white shadow-2xl flex flex-col"
          >
            <div className="p-8 flex justify-between items-center">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                <span className="font-serif text-2xl">M</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 p-2 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 px-6 space-y-2">
              {menuItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    pathname === item.path 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-gray-400 hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="p-6 border-t border-primary/5">
              <button 
                 onClick={() => router.push('/')}
                className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-red-50 transition-all w-full"
              >
                <LogOut size={20} />
                Quitter
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </div>
  );
}
