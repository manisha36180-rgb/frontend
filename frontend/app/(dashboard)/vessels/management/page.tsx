'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { vesselsApi } from '@/services/api';

import { 
  Plus, 
  Search, 
  Ship, 
  Pencil, 
  Trash2, 
  X,
  RefreshCw,
  List,
  ShieldCheck,
  ChevronRight,
  Database,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function VesselManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [vessels, setVessels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showList, setShowList] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<any>(null);
  const [formData, setFormData] = useState({ vesselName: '', vesselType: '', imoNumber: '' });

  useEffect(() => {
    fetchVessels();
  }, []);

  const fetchVessels = async () => {
    try {
      setIsLoading(true);
      const data = await vesselsApi.getAll();
      setVessels(data || []);
      setShowList(true);
    } catch (error) {
      console.error('Failed to fetch vessels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVessel) {
        await vesselsApi.update(editingVessel.id, formData);
      } else {
        await vesselsApi.create(formData);
      }
      setIsModalOpen(false);
      setEditingVessel(null);
      setFormData({ vesselName: '', vesselType: '', imoNumber: '' });
      if (showList) fetchVessels();
    } catch (error) {
      alert('Error saving vessel.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await vesselsApi.delete(id);
      fetchVessels();
    } catch (error) {
      alert('Error deleting vessel.');
    }
  };

  const openEdit = (v: any) => {
    setEditingVessel(v);
    setFormData({ 
      vesselName: v.vesselName || v.vessel_name || '', 
      vesselType: v.vesselType || v.vessel_type || '', 
      imoNumber: v.imoNumber || v.imo_number || '' 
    });
    setIsModalOpen(true);
  };

  const filteredVessels = vessels.filter(v => 
    (v.vesselName || v.vessel_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.imoNumber || v.imo_number || '').includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto pt-8 pb-24 space-y-16">
      {/* PROFESSIONAL DARK HEADER */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-accent">
          <ShieldCheck className="w-3 h-3" />
          Fleet Control Center
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
          Vessel <span className="text-accent">Management</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl mx-auto">
          Manage your fleet registry with enterprise-grade precision and real-time Supabase synchronization.
        </p>
      </div>

      {/* ACTION CENTER - PREMIUM CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { id: 1, label: 'Create', icon: Plus, color: 'accent', onClick: () => { setEditingVessel(null); setIsModalOpen(true); } },
          { id: 2, label: 'Edit', icon: Pencil, color: 'blue-500', onClick: () => { if(!showList) fetchVessels(); } },
          { id: 3, label: 'Delete', icon: Trash2, color: 'red-500', onClick: () => { if(!showList) fetchVessels(); } },
          { id: 4, label: 'Get by ID', icon: Search, color: 'slate-400', onClick: () => { setShowList(true); setTimeout(() => document.getElementById('search-v')?.focus(), 100); } },
          { id: 5, label: 'Get All', icon: List, color: 'accent', onClick: fetchVessels },
        ].map((opt) => (
          <button 
            key={opt.id}
            onClick={opt.onClick}
            className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-[40px] hover:border-accent hover:shadow-2xl hover:shadow-accent/5 dark:hover:bg-[#1E293B] transition-all group backdrop-blur-sm"
          >
            <div className={cn(
              "w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-inner",
              `bg-${opt.color}/10 text-${opt.color} group-hover:bg-accent group-hover:text-white group-hover:scale-110`
            )}>
              <opt.icon className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-foreground">{opt.id}. {opt.label}</span>
          </button>
        ))}
      </div>

      {/* DYNAMIC RESULTS AREA */}
      <AnimatePresence>
        {showList && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-accent/20 blur-[100px] opacity-0 group-focus-within:opacity-30 transition-all" />
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-accent transition-colors" />
              <input 
                id="search-v"
                type="text"
                placeholder="Lookup by Name, Type or IMO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-20 pr-8 py-7 bg-white dark:bg-[#0B1120]/80 border-2 border-slate-100 dark:border-[#334155] rounded-[32px] text-xl font-bold outline-none focus:border-accent transition-all text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 shadow-xl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVessels.map(v => (
                <motion.div 
                  key={v.id}
                  whileHover={{ y: -5 }}
                  className="p-8 bg-white dark:bg-[#111827] border border-slate-100 dark:border-[#334155] rounded-[40px] hover:border-accent transition-all shadow-lg group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
                    <Ship className="w-32 h-32" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
                      <Ship className="w-6 h-6" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(v)} className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-accent/10 rounded-xl text-slate-600 dark:text-slate-400 hover:text-accent transition-all"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(v.id)} className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-red-500/10 rounded-xl text-slate-600 dark:text-slate-400 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">{v.vesselName || v.vessel_name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-accent uppercase tracking-widest">{v.vesselType || v.vessel_type}</span>
                      <div className="w-1 h-1 bg-slate-300 dark:bg-[#334155] rounded-full" />
                      <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">IMO: {v.imoNumber || v.imo_number}</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Registry ID: {v.id.slice(0,8)}...</span>
                    <button className="text-accent text-[10px] font-black flex items-center gap-1 hover:underline">
                      FULL FILE <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PREMIUM MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-[60px] p-16 w-full max-w-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] relative">
              <div className="absolute top-12 right-12">
                <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-slate-100 dark:hover:bg-white/10 rounded-3xl transition-all">
                  <X className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              <div className="space-y-12">
                <div className="space-y-4 text-center">
                  <div className="w-20 h-20 bg-accent/10 rounded-[32px] flex items-center justify-center text-accent mx-auto">
                    <Ship className="w-10 h-10" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tighter">
                    {editingVessel ? 'Update Registry' : 'New Vessel Registry'}
                  </h2>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[#94A3B8] ml-4 tracking-[0.2em]">Vessel Identification</label>
                      <input type="text" required placeholder="Full Vessel Name" value={formData.vesselName} onChange={(e) => setFormData({...formData, vesselName: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-[#111827] border-2 border-transparent focus:border-accent dark:focus:border-accent rounded-[32px] outline-none font-bold text-slate-900 dark:text-[#F8FAFC] placeholder:text-[#94A3B8] transition-all text-lg shadow-inner" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-[#94A3B8] ml-4 tracking-[0.2em]">Classification</label>
                        <input type="text" required placeholder="Vessel Type" value={formData.vesselType} onChange={(e) => setFormData({...formData, vesselType: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-[#111827] border-2 border-transparent focus:border-accent dark:focus:border-accent rounded-[32px] outline-none font-bold text-slate-900 dark:text-[#F8FAFC] placeholder:text-[#94A3B8] transition-all shadow-inner" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-[#94A3B8] ml-4 tracking-[0.2em]">IMO Standard</label>
                        <input type="text" required placeholder="IMO Number" value={formData.imoNumber} onChange={(e) => setFormData({...formData, imoNumber: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-[#111827] border-2 border-transparent focus:border-accent dark:focus:border-accent rounded-[32px] outline-none font-bold text-slate-900 dark:text-[#F8FAFC] placeholder:text-[#94A3B8] transition-all shadow-inner" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6 pt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-6 bg-slate-100 dark:bg-white/10 rounded-[32px] font-black text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20 transition-all uppercase tracking-widest text-xs">DISCARD</button>
                    <button type="submit" className="flex-1 py-6 bg-accent text-white rounded-[32px] font-black shadow-2xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs">COMMIT REGISTRY</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
