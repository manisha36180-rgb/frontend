'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { 
  Plus, 
  Search, 
  Ship, 
  FileText,
  ChevronDown,
  X,
  ExternalLink,
  ShieldCheck,
  Check,
  Loader2,
  RefreshCw,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const INSPECTION_TABLES = [
  'ballast_tanks', 'bulk', 'cargo_lifting_gear', 'cargo_tanks', 'certificate',
  'communication', 'constructive_fire_protection', 'container_specifies',
  'crew_accommodation', 'crew_evaluation', 'crew_health', 'crew_safety',
  'deck', 'deck_machinery', 'document_control', 'electrical_items',
  'engine_room', 'fire_fighting_equipment', 'firefighting_fixed_system',
  'hatch_coamings', 'hatch_covers', 'holds', 'hull_inboard', 'hull_outboard',
  'hull_structure', 'life_saving_apparatus', 'machinery_arrangements',
  'maintenance_equipment', 'materials', 'mooring_arrangements',
  'navigational_equipment', 'oil_pollution_equipment', 'pctc_specifics',
  'pilot_boarding_arrangements', 'pollution_prevention', 'pollution_prevention_tankers',
  'protection_against_flooding', 'publication_documents', 'pumps_performance',
  'radio_equipments', 'radio_navigation', 'reporting_systems',
  'safety_equipment', 'safety_of_navigation', 'sea_trial', 'ships_pyrotechnics',
  'supply_connections', 'tankage', 'tanker_equipment', 'tanker_specifics', 'towing'
];

export default function VesselsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [vessels, setVessels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVessel, setNewVessel] = useState({ vesselName: '', vesselType: '', imoNumber: '' });
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchVessels();
  }, []);

  useEffect(() => {
    if (selectedVessel) {
      fetchCounts();
    }
  }, [selectedVessel]);

  const fetchCounts = async () => {
    try {
      const newCounts: Record<string, number> = {};
      await Promise.all(INSPECTION_TABLES.map(async (table) => {
        let query = supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        if (selectedVessel) {
          query = query.eq('vessel_id', selectedVessel);
        }
        
        const { count, error } = await query;
        if (!error) newCounts[table] = count || 0;
      }));
      setCounts(newCounts);
    } catch (error) {
      console.error('Failed to fetch category counts:', error);
    }
  };

  const fetchVessels = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .order('vesselName');
      
      if (error) throw error;
      setVessels(data || []);
      if (data && data.length > 0 && !selectedVessel) {
        setSelectedVessel(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch vessels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (table: string) => {
    router.push(`/vessels/inspect?category=${table}${selectedVessel ? `&vesselId=${selectedVessel}` : ''}`);
  };

  const currentVessel = vessels.find(v => v.id === selectedVessel);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4">
      {/* TOP HEADER SECTION */}
      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">Vessel Inspections</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Select a vessel and module to begin reporting</p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-[#4F46E5] text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-500/20 border-2 border-white dark:border-[#111827]"
            >
              <Plus className="w-4 h-4" />
              Add Vessel
            </button>
          </div>
        </div>

        <div className="mt-8">
          {/* Badges removed per request */}
        </div>
      </div>

      {/* COMPACT INSPECTION GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 bg-card border border-border rounded-[40px] shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
            <p className="text-xs font-bold uppercase tracking-widest">Initializing Vessel Registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {INSPECTION_TABLES.filter(t => t.toLowerCase().includes(categorySearch.toLowerCase())).map((table) => (
            <motion.div 
              key={table}
              whileHover={{ y: -4 }}
              onClick={() => handleCategoryClick(table)}
              className="group p-6 bg-card border border-border rounded-2xl transition-all hover:shadow-xl hover:border-accent/30 relative cursor-pointer"
            >
              <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center mb-6 text-slate-400 group-hover:text-accent transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-foreground leading-tight break-words">
                  {table.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">
                      {counts[table] !== undefined ? `${counts[table]} Records` : 'View Report'}
                    </span>
                    {counts[table] > 0 && (
                      <div className="w-4 h-4 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-accent transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ADD VESSEL MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-[32px] p-12 w-full max-w-xl shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
                <X className="w-6 h-6 text-slate-400" />
              </button>
              <h2 className="text-3xl font-black mb-8 text-slate-900 dark:text-white tracking-tight uppercase">New Vessel Registry</h2>
              <form onSubmit={async (e) => {
                 e.preventDefault();
                 const { error } = await supabase.from('vessels').insert([newVessel]);
                 if (!error) {
                   setIsModalOpen(false);
                   fetchVessels();
                 }
              }} className="space-y-6">
                <input type="text" required placeholder="Vessel Name" value={newVessel.vesselName} onChange={(e) => setNewVessel({...newVessel, vesselName: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-transparent focus:border-accent rounded-2xl outline-none font-bold text-sm" />
                <input type="text" required placeholder="Vessel Type" value={newVessel.vesselType} onChange={(e) => setNewVessel({...newVessel, vesselType: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-transparent focus:border-accent rounded-2xl outline-none font-bold text-sm" />
                <input type="text" required placeholder="IMO Number" value={newVessel.imoNumber} onChange={(e) => setNewVessel({...newVessel, imoNumber: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-transparent focus:border-accent rounded-2xl outline-none font-bold text-sm" />
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-[#4F46E5] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20">Add Vessel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
