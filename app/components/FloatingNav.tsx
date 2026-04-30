'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function FloatingNav({ isAdmin }: { isAdmin: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const isAdminArea = pathname?.startsWith('/admin');

  const userNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Match Center', href: '/matches', icon: '⚽' },
    { name: 'Classifica', href: '/leaderboard', icon: '🏆' },
    { name: 'Scommesse', href: '/history', icon: '📜' },
    { name: 'Profilo', href: '/profile', icon: '👤' },
  ];

  let navItems = [...userNavItems];

  if (isAdminArea) {
    navItems = [
      { name: 'Admin Home', href: '/admin', icon: '🛠️' },
      { name: 'Utenti (GC)', href: '/admin/users', icon: '👥' },
      { name: 'Squadre', href: '/admin/teams', icon: '🛡️' },
      { name: 'Partite', href: '/admin/matches', icon: '🏟️' },
      { name: 'Torna all\'App', href: '/dashboard', icon: '🔙' },
    ];
  } else if (isAdmin) {
    navItems.push({ name: 'Admin', href: '/admin', icon: '⚙️' });
  }

  return (
    <>
      {/* Mobile & Desktop Floating Pill */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center">
        
        {/* Backdrop for clicking outside */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[-1] cursor-default"
            />
          )}
        </AnimatePresence>
        {/* Expanded Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="mb-4 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-2 flex flex-col gap-1 w-64 origin-bottom"
            >
              {navItems.map((item) => {
                const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/dashboard');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium ${
                      isActive 
                        ? 'bg-indigo-500/20 text-white shadow-inner border border-indigo-500/30' 
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}

              <div className="h-px w-full bg-white/10 my-1"></div>
              
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push('/login')
                  router.refresh()
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full text-left"
              >
                <span className="text-xl">🚪</span>
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Pill */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-indigo-600/90 hover:bg-indigo-500 backdrop-blur-md border border-white/20 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] rounded-full pl-3 pr-6 py-2 flex items-center gap-3 font-bold text-sm tracking-wide transition-colors"
        >
          <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full border border-white/30" />
          <span className="w-px h-5 bg-white/30"></span>
          <span>{isOpen ? 'Chiudi' : 'Menu'}</span>
          
          {/* Animated Hamburger/Close Icon */}
          <div className="relative w-5 h-5 ml-1 flex items-center justify-center">
            <motion.span 
              animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 0 : -4 }} 
              className="absolute w-5 h-0.5 bg-white rounded-full transition-transform"
            />
            <motion.span 
              animate={{ opacity: isOpen ? 0 : 1 }} 
              className="absolute w-5 h-0.5 bg-white rounded-full transition-opacity"
            />
            <motion.span 
              animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? 0 : 4 }} 
              className="absolute w-5 h-0.5 bg-white rounded-full transition-transform"
            />
          </div>
        </motion.button>
      </div>
    </>
  );
}
