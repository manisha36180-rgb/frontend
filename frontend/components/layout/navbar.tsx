'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Bell, Search, Menu, User as UserIcon, Sun, Moon, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="nav-glass h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search everything..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-white/5 border-none rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
        
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-maritime-dark" />
        </button>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-2" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">{user?.role || 'User'}</p>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-blue-400 flex items-center justify-center text-white font-bold border-2 border-white dark:border-maritime-dark shadow-sm">
            {user?.name?.charAt(0) || <UserIcon className="w-5 h-5" />}
          </div>

          <button 
            onClick={() => {
              console.log('Navbar Logout Clicked');
              logout();
            }}
            className="ml-2 px-4 py-2.5 bg-red-500 text-white hover:bg-red-600 rounded-xl transition-all shadow-md flex items-center gap-2 text-xs font-bold"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden md:inline">SIGN OUT</span>
          </button>
        </div>
      </div>
    </header>
  );
}
