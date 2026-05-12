'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { vesselsApi } from '@/services/api';

import { 
  Plus, 
  Search, 
  Ship, 
  CheckCircle2,
  FileText,
  ExternalLink,
  ChevronDown
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
  const { user, hasRole } = useAuth();
  const router = useRouter();
  const [vessels, setVessels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState('');

  useEffect(() => {
    fetchVessels();
  }, []);

  const fetchVessels = async () => {
    try {
      setIsLoading(true);
      const data = await vesselsApi.getAll();
      
      const filteredData = (data || []).filter((v: any) => {
        const name = v.vessel_name || v.vesselName || v.name;
        return name !== 'Inspection Vessel 01' && name !== 'Ocean Voyager 02';
      });
      
      setVessels(filteredData);
      if (filteredData.length > 0) {
        setSelectedVessel(filteredData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch vessels:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const handleCategoryClick = (table: string) => {
    if (!selectedVessel) return;
    router.push(`/vessels/inspect?vesselId=${selectedVessel}&category=${table}`);
  };

  const selectedVesselData = vessels.find(v => v.id === selectedVessel);

  return (
    <div className="space-y-8 pb-24">
      {/* Simplified Header with Vessel Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Inspection Categories</h1>
          <p className="text-slate-500">Manage 51 inspection categories for the selected vessel</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search 51 inspection categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="pl-11 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm outline-none focus:ring-2 ring-accent transition-all min-w-[300px]"
          />
        </div>
      </div>

      {/* Grid of 51 Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {INSPECTION_TABLES.filter(t => t.toLowerCase().includes(categorySearch.toLowerCase())).map((table) => (
          <motion.button 
            key={table}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCategoryClick(table)}
            className="group relative p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl text-left transition-all hover:shadow-2xl hover:shadow-accent/10 hover:border-accent shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-slate-50 dark:bg-white/10 group-hover:bg-accent group-hover:text-white transition-all shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
            
            <h3 className="text-xs font-black uppercase tracking-tight leading-tight text-slate-900 dark:text-white group-hover:text-accent transition-colors break-words">
              {table.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </h3>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-accent/70 transition-colors">
                View Report
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-white/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>

            {/* Subtle indicator bar */}
            <div className="absolute bottom-0 left-6 right-6 h-1 bg-accent/0 group-hover:bg-accent rounded-full transition-all" />
          </motion.button>
        ))}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold animate-pulse">Loading categories...</p>
        </div>
      )}

      {!isLoading && vessels.length === 0 && (
        <div className="text-center py-32 bg-slate-50 dark:bg-white/5 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-white/10">
          <Ship className="w-16 h-16 text-slate-300 mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-bold text-slate-600">No Vessels Available</h2>
          <p className="text-slate-400 mt-2">Register a vessel in the admin panel to start inspections.</p>
        </div>
      )}
    </div>
  );
}
