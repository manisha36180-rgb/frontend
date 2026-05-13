'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Ship, 
  ClipboardList, 
  Settings, 
  Users, 
  ShieldCheck, 
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['ADMIN', 'USER', 'SUPERINTENDENT'] },
  { icon: Ship, label: 'Vessels', href: '/vessels', roles: ['ADMIN', 'USER', 'SUPERINTENDENT'] },
  { icon: Settings, label: 'Vessel Management', href: '/vessels/categories', roles: ['ADMIN', 'SUPERINTENDENT'] },
  { icon: ClipboardList, label: 'Reports', href: '/reports', roles: ['ADMIN', 'USER', 'SUPERINTENDENT'] },
  { icon: ShieldCheck, label: 'Admin Panel', href: '/admin', roles: ['ADMIN'] },
  { icon: Users, label: 'User Management', href: '/admin/users', roles: ['ADMIN'] },
];

export function Sidebar({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filteredMenu = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 sidebar-glass transition-all duration-300 ease-in-out lg:static lg:block",
      isOpen ? "w-64" : "w-0 lg:w-20 -translate-x-full lg:translate-x-0"
    )}>
      <div className="flex flex-col h-full text-white">
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <div className={cn("flex items-center gap-3", !isOpen && "lg:hidden")}>
            <Ship className="w-8 h-8 text-accent" />
            <span className="font-bold text-lg tracking-tight">SELLAMSOFT</span>
          </div>
          <button onClick={toggle} className="lg:hidden">
            <ChevronLeft className="w-6 h-6" />
          </button>
          {!isOpen && <Ship className="w-8 h-8 text-accent mx-auto hidden lg:block" />}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1 px-3 overflow-y-auto">
          {filteredMenu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                    isActive 
                      ? "bg-accent text-white shadow-lg shadow-accent/20" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-accent")} />
                <span className={cn(
                  "font-medium transition-opacity duration-300",
                  !isOpen && "lg:hidden opacity-0"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#334155]">
          <button 
            onClick={() => {
              console.log('Sidebar Logout Clicked');
              logout();
            }}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
            )}
          >
            <LogOut className="w-5 h-5" />
            <span className={cn(
              "font-medium transition-opacity duration-300",
              !isOpen && "lg:hidden opacity-0"
            )}>
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
