'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus,
  FileText, 
  ChevronDown, 
  ChevronRight, 
  Pencil, 
  CheckCircle2, 
  Eye, 
  Trash2,
  Search,
  ArrowLeft,
  X,
  Save,
  Check
} from 'lucide-react';
import InspectionTable from '@/components/InspectionTable';
import { updateTableRow } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
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

export default function CategoryManagementPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states for "Make all accessible"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete'>('create');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeRow, setActiveRow] = useState<any>(null);
  const [formData, setFormData] = useState({ s_no: '', requirements: '', rule_ref: '', ans: '', comments: '' });
  const [isSaving, setIsSaving] = useState(false);

  const formatName = (name: string) => {
    return name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const handleAction = (type: 'create' | 'edit' | 'delete', category: string, row?: any) => {
    setModalType(type);
    setActiveCategory(category);
    setActiveRow(row || null);
    
    if (type === 'edit' && row) {
      setFormData({ 
        s_no: row.s_no || '', 
        requirements: row.requirements || '', 
        rule_ref: row.rule_ref || '',
        ans: row.ans || '',
        comments: row.comments || ''
      });
    } else {
      setFormData({ s_no: '', requirements: '', rule_ref: '', ans: '', comments: '' });
    }
    
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory) return;

    try {
      setIsSaving(true);
      if (modalType === 'create') {
        const { error } = await supabase.from(activeCategory).insert([formData]);
        if (error) throw error;
      } else if (modalType === 'edit' && activeRow) {
        const { error } = await supabase.from(activeCategory).update(formData).eq('id', activeRow.id);
        if (error) throw error;
      } else if (modalType === 'delete' && activeRow) {
        const { error } = await supabase.from(activeCategory).delete().eq('id', activeRow.id);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      // Refresh logic would go here (e.g., re-triggering InspectionTable load)
      alert(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} successful!`);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCategories = CATEGORIES.filter(cat => 
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Vessel Management</h1>
            <p className="text-muted-foreground font-medium mt-1">Manage 51 technical modules and parameters.</p>
          </div>
        </div>

        <div className="relative w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent transition-colors" />
          <input 
            type="text"
            placeholder="Search 51 modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-accent rounded-2xl text-sm font-bold outline-none transition-all"
          />
        </div>
      </div>

      {/* CATEGORY LIST UI LIKE REFERENCE IMAGE */}
      <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-2xl">
        <div className="grid grid-cols-2 px-8 py-5 border-b border-border bg-secondary/30">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Vessels / Categories</span>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Actions</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {filteredCategories.map((cat) => (
            <div key={cat} className="group">
              <div className="flex items-center justify-between px-8 py-6 hover:bg-secondary/20 transition-colors border-b border-border last:border-0">
                <div 
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpanded(expanded === cat ? null : cat)}
                >
                  <div className="text-muted-foreground">
                    {expanded === cat ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                  <span className="text-sm font-black text-foreground uppercase tracking-tight ml-2">{formatName(cat)}</span>
                </div>

                <div className="flex items-center gap-6">
                  {/* ACTIONS ACCESSIBLE */}
                  <button 
                    title="Add Requirement"
                    onClick={() => handleAction('create', cat)}
                    className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button 
                    title="Edit Module"
                    onClick={() => setExpanded(expanded === cat ? null : cat)}
                    className="p-2 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-all"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button 
                    title="Approve All"
                    onClick={async () => {
                      if(confirm(`Approve all records in ${cat}?`)) {
                        await supabase.from(cat).update({ ans: 'Yes', comments: 'Approved' }).is('vessel_id', null);
                        alert('All records approved.');
                      }
                    }}
                    className="p-2 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-lg transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <button 
                    title="View Data Table"
                    onClick={() => setExpanded(expanded === cat ? null : cat)}
                    className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-all"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button 
                    title="Clear Category"
                    onClick={async () => {
                      if(confirm(`Wipe all data in ${cat}?`)) {
                        await supabase.from(cat).delete().is('vessel_id', null);
                        alert('Category cleared.');
                      }
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* EXPANDED SECTION */}
              <AnimatePresence>
                {expanded === cat && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-orange-50/30 dark:bg-orange-500/5 px-20 pb-6"
                  >
                    <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl">
                      <InspectionTable tableName={cat} vesselId={null} vesselName="Global Registry" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* LEGEND AS IN IMAGE */}
      <div className="mt-12 flex items-center gap-10 bg-card border border-border rounded-3xl p-6 shadow-sm w-fit mx-auto">
        <div className="flex items-center gap-3">
          <Plus className="w-5 h-5 text-indigo-500" />
          <span className="text-[10px] font-black uppercase text-muted-foreground">Create</span>
        </div>
        <div className="flex items-center gap-3">
          <Pencil className="w-5 h-5 text-sky-500" />
          <span className="text-[10px] font-black uppercase text-muted-foreground">Edit</span>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-teal-500" />
          <span className="text-[10px] font-black uppercase text-muted-foreground">Approve</span>
        </div>
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-amber-500" />
          <span className="text-[10px] font-black uppercase text-muted-foreground">View Details</span>
        </div>
        <div className="flex items-center gap-3">
          <Trash2 className="w-5 h-5 text-rose-500" />
          <span className="text-[10px] font-black uppercase text-muted-foreground">Delete</span>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-[40px] p-12 w-full max-w-xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  {modalType === 'create' ? 'Add New Requirement' : 'Edit Requirement'}
                </h2>
                <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Serial No</label>
                      <input 
                        type="text" 
                        placeholder="e.g. DEC-37"
                        value={formData.s_no}
                        onChange={(e) => setFormData({...formData, s_no: e.target.value})}
                        className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-accent rounded-2xl outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Rule Reference</label>
                      <input 
                        type="text"
                        placeholder="Optional"
                        value={formData.rule_ref}
                        onChange={(e) => setFormData({...formData, rule_ref: e.target.value})}
                        className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-accent rounded-2xl outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Requirement Description</label>
                    <textarea 
                      required
                      rows={3}
                      value={formData.requirements}
                      onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-accent rounded-2xl outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-black text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {modalType === 'create' ? 'Create Requirement' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
