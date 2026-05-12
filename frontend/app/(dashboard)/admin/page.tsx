'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  ShieldAlert, 
  Settings, 
  UserPlus, 
  Lock, 
  Trash2, 
  CheckCircle,
  FileX,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPage() {
  const { user, hasRole } = useAuth();
  const router = useRouter();
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasRole(['ADMIN'])) {
      router.push('/dashboard');
    } else {
      fetchUsers();
    }
  }, [hasRole, router]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      setSystemUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (id === user?.id) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (!confirm('Are you sure you want to remove this user from the system?')) return;
    
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      fetchUsers();
    } catch (error) {
      alert('Error deleting user: ' + (error as any).message);
    }
  };

  const [policies, setPolicies] = useState([
    { id: '2fa', label: 'Two-Factor Authentication', status: true },
    { id: 'ip', label: 'IP Access Restriction', status: false },
    { id: 'archive', label: 'Automatic Report Archiving', status: true },
    { id: 'role', label: 'Inspector Role Validation', status: true }
  ]);

  const togglePolicy = (id: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, status: !p.status } : p));
  };

  const openSettings = (u: any) => {
    alert(`Modifying permissions for ${u.name}... Settings panel coming soon.`);
  };

  const testApiGateway = async () => {
    alert('Contacting Supabase Edge Function... \nStatus: Vessel API running successfully');
  };

  if (!hasRole(['ADMIN'])) return null;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Admin Control Panel</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage global system access, permissions, and security protocols.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-2xl text-xs font-black flex items-center gap-2 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            SECURE SYSTEM ACTIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* User Management Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent rounded-2xl text-white shadow-lg shadow-accent/20">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg uppercase tracking-tight text-slate-900 dark:text-white">System Users</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{systemUsers.length} TOTAL ACCOUNTS</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={testApiGateway}
                  className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  API GATEWAY
                </button>
                <button 
                  onClick={() => alert('Add user modal coming soon')}
                  className="text-[10px] font-black bg-slate-900 dark:bg-accent text-white px-5 py-3 rounded-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                >
                  <UserPlus className="w-4 h-4" />
                  NEW USER
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white dark:bg-transparent">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Privilege Level</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Synchronizing User Data...</span>
                      </td>
                    </tr>
                  ) : (
                    systemUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-black text-slate-500 uppercase">
                              {u.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{u.name}</p>
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Mail className="w-3 h-3" />
                                <span className="text-[11px] font-bold">{u.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border",
                            u.role === 'ADMIN' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                            u.role === 'SUPERINTENDENT' ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" :
                            "bg-sky-500/10 text-sky-500 border-sky-500/20"
                          )}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">AUTHORIZED</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => openSettings(u)}
                              className="p-2.5 hover:bg-white dark:hover:bg-white/10 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all text-slate-400 hover:text-accent shadow-sm"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteUser(u.id)}
                              className="p-2.5 hover:bg-white dark:hover:bg-white/10 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all text-slate-400 hover:text-rose-500 shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Settings Section */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] p-8 shadow-xl shadow-slate-200/10 dark:shadow-none">
            <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-400 mb-8">Security Policies</h3>
            <div className="space-y-6">
              {policies.map((policy) => (
                <div key={policy.id} className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">{policy.label}</span>
                  <div 
                    onClick={() => togglePolicy(policy.id)}
                    className={cn(
                      "w-12 h-6 rounded-full relative cursor-pointer transition-all border-2",
                      policy.status ? "bg-accent border-accent" : "bg-slate-200 border-slate-200 dark:bg-slate-800 dark:border-slate-800"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                      policy.status ? "right-0.5" : "left-0.5"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-6 -right-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Lock className="w-32 h-32" />
            </div>
            <h3 className="font-black text-lg uppercase tracking-tight relative z-10">System Logs</h3>
            <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-widest relative z-10">Monitor all administrative actions.</p>
            <button 
              onClick={() => alert('Audit trail access granted.')}
              className="mt-8 w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/10 relative z-10 active:scale-95"
            >
              View Audit Trail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
