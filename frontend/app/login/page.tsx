'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Ship, Lock, Mail, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* Background Decoration - simplified for better network performance */}
      <div className="absolute inset-0 z-0 bg-[#020617] opacity-100">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-slate-800/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl mx-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
            <Ship className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight text-center">Sellamsoft Portal</h1>
          <p className="text-slate-400 mt-2 text-center">Sign in to your inspection dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none text-white placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none text-white placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/25"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
            {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-slate-500 text-sm">
            Need access? <span className="text-accent hover:underline cursor-pointer">Contact Administration</span>
          </p>
        </div>
      </div>
    </div>
  );
}
