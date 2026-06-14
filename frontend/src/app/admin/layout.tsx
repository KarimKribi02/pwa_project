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
  Mail
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserByEmail } from '@/services/api';

interface AdminUser {
  nom?: string;
  role?: string;
  email?: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // 1. Fetch Admin User details
  useEffect(() => {
    async function fetchUser() {
      try {
        const stored = localStorage.getItem("admin_user");
        if (!stored) return;

        const userLocal = JSON.parse(stored);
        const data = await getUserByEmail(userLocal.email);
        setUser(data);
      } catch (err) {
        console.error("Failed to load admin user info:", err);
      }
    }

    fetchUser();
  }, []);

  // 2. Hide public footer on all admin routes safely
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = document.querySelector('footer');
    if (el instanceof HTMLElement) {
      const originalDisplay = el.style.display;
      el.style.display = 'none';
      return () => {
        el.style.display = originalDisplay;
      };
    }
  }, []);

  // 3. Early return for login screen (must be placed below all hook invocations)
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { name: 'Catégories', icon: <FileText size={20} />, path: '/admin/categories' },
    { name: 'Produits', icon: <Package size={20} />, path: '/admin/products' },
    { name: 'Commandes', icon: <ShoppingCart size={20} />, path: '/admin/orders' },
    { name: 'Facturation', icon: <FileText size={20} />, path: '/admin/billing' },
    { name: 'Messages', icon: <Mail size={20} />, path: '/admin/messages' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="bg-white w-72 border-r border-[#2D5A27]/5 flex-col hidden lg:flex">
        <div className="p-8 border-b border-[#2D5A27]/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2D5A27] rounded-xl flex items-center justify-center text-white">
              <span className="font-serif text-2xl">M</span>
            </div>
            <div>
              <h2 className="font-serif text-lg text-[#2D5A27] leading-none font-bold">Atelier</h2>
              <p className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest mt-1">Admin Panel</p>
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
                  ? "bg-[#2D5A27] text-white shadow-lg shadow-[#2D5A27]/20" 
                  : "text-gray-400 hover:bg-[#2D5A27]/5 hover:text-[#2D5A27]"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-[#2D5A27]/5">
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
        <header className="h-16 sm:h-20 bg-white border-b border-[#2D5A27]/5 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#2D5A27] p-2 bg-[#2D5A27]/5 rounded-lg shrink-0">
              <Menu size={24} />
            </button>

            <h1 className="font-serif text-lg sm:text-xl md:text-2xl text-[#2D5A27] truncate font-bold">
              {menuItems.find(item => item.path === pathname)?.name || 'Administration'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <h3 className="text-sm font-bold text-gray-900">
                {user?.nom || "Utilisateur"}
              </h3>
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">
                {user?.role || "Rôle"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-stone-100 border border-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27] overflow-hidden">
              <User size={20} />
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={() => setSidebarOpen(false)} 
            />
            <motion.aside 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 w-72 h-full bg-white shadow-2xl flex flex-col"
            >
              <div className="p-8 flex justify-between items-center">
                <div className="w-10 h-10 bg-[#2D5A27] rounded-xl flex items-center justify-center text-white">
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
                        ? "bg-[#2D5A27] text-white shadow-lg shadow-[#2D5A27]/20" 
                        : "text-gray-400 hover:bg-[#2D5A27]/5 hover:text-[#2D5A27]"
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="p-6 border-t border-[#2D5A27]/5">
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
      </AnimatePresence>
    </div>
  );
}
