'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { getUserByEmail } from '@/services/api';
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await getUserByEmail(email);
      
      if (user.mot_passe === password) {
        if (user.role === 'admin') {
          // Set basic session in localStorage for this demo
          localStorage.setItem('admin_user', JSON.stringify(user));
          localStorage.setItem('userEmail', email);
          router.push('/admin/dashboard');
        } else {
          setError("Accès refusé. Vous n'avez pas les droits d'administration.");
        }
      } else {
        setError("Mot de passe incorrect.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Utilisateur introuvable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-primary/5"
      >
        <div className="bg-primary p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
          <div className="relative z-10">
            <h1 className="font-serif text-3xl text-white mb-2 tracking-tight">Atelier Digital</h1>
            <p className="text-white/70 text-xs font-work uppercase tracking-widest font-bold">Administration Portal</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-10 space-y-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 animate-shake">
              {error}
            </div>
          )}
          <div className="space-y-6">
            <div className="relative">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2 block">Identifiant</label>
              <div className="flex items-center border-b-2 border-primary/10 focus-within:border-primary transition-all pb-2 group">
                <Mail className="text-gray-400 group-focus-within:text-primary transition-colors mr-3" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@menuiserie.digital"
                  className="w-full bg-transparent outline-none text-primary font-medium placeholder:text-gray-300"
                  required 
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2 block">Mot de Passe</label>
              <div className="flex items-center border-b-2 border-primary/10 focus-within:border-primary transition-all pb-2 group">
                <Lock className="text-gray-400 group-focus-within:text-primary transition-colors mr-3" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-primary font-medium placeholder:text-gray-300"
                  required 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Accéder au Dashboard
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="text-center">
            <Link href="/" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">
              Retour au site public
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
