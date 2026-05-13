'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Ship, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Download
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { useSearchParams } from 'next/navigation';
import { vesselsApi, reportsApi } from '@/services/api';
import InspectionTable from '@/components/InspectionTable';


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

export default function DashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<any[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(INSPECTION_TABLES[0]);
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const vesselId = searchParams.get('vesselId');
    const category = searchParams.get('category');
    
    if (vesselId) setSelectedVessel(vesselId);
    if (category) {
      const match = INSPECTION_TABLES.find(t => t.toLowerCase() === category.toLowerCase());
      if (match) setSelectedTable(match);
    }
  }, [searchParams]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching dashboard data...');
      const [vesselsData, reportsData] = await Promise.all([
        vesselsApi.getAll(),
        reportsApi.getAll()
      ]);

      console.log('Vessels fetched:', vesselsData?.length);
      console.log('Reports fetched:', reportsData?.length);

      if (vesselsData) setVessels(vesselsData);
      if (reportsData) setReports(reportsData);
      
      if (vesselsData && vesselsData.length > 0) {
        setSelectedVessel(vesselsData[0].id);
      }
    } catch (error: any) {
      console.error('Dashboard fetch failed:', error.message || error);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      setReports([]);
      setVessels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const approveReport = async (reportId: string) => {
    if (user?.role !== 'ADMIN') return;
    try {
      await reportsApi.approve(reportId);
      fetchDashboardData();
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const deleteReport = async (reportId: string) => {
    if (user?.role !== 'ADMIN') return;
    try {
      await reportsApi.delete(reportId);
      fetchDashboardData();
    } catch (error) {
      console.error('Deletion failed:', error);
    }
  };


  const stats = [
    { label: 'Total Vessels', value: vessels.length, icon: Ship, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Reports', value: reports.length, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Pending Approvals', value: reports.filter(r => r.status === 'PENDING').length, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Approved Reports', value: reports.filter(r => r.status === 'APPROVED').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  const currentVessel = vessels.find(v => v.id === selectedVessel) || vessels[0];


  const exportToExcel = () => {
    if (!reports.length) {
      alert("No reports available to export.");
      return;
    }
    const headers = ['ID', 'Title', 'Category', 'Status', 'Vessel ID'];
    const rows = reports.map(r => [r.id, r.title, r.category, r.status, r.vesselId]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inspection_Reports_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12 print:p-0 print:m-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Vessel Inspection System</h1>
          <p className="text-slate-600 dark:text-white/80 mt-1 font-medium">Welcome back, {user?.name} ({user?.role})</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111827] border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Excel Export
          </button>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111827] border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-500 hover:text-white transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            PDF Export
          </button>
        </div>
      </div>

      {/* Stats Grid Removed */}

      {/* 51 Categories Grid Section on Dashboard */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold flex items-center gap-2 text-foreground uppercase tracking-wider">
            <div className="p-1.5 bg-accent/10 rounded-lg text-accent">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            Inspection Modules
          </h2>
          <span className="text-[10px] font-bold text-muted-foreground dark:text-white/60 uppercase tracking-widest">{INSPECTION_TABLES.length} Categories</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {INSPECTION_TABLES.map((table) => (
            <button 
              key={table}
              onClick={() => setSelectedTable(table)}
              className={cn(
                "px-3 py-1.5 rounded-lg border text-left transition-all text-[11px] font-semibold truncate",
                selectedTable === table 
                  ? "bg-accent text-white border-accent shadow-md shadow-accent/20" 
                  : "bg-secondary border-transparent text-slate-600 dark:text-white/70 hover:border-border hover:bg-slate-100 dark:hover:bg-white/10"
              )}
            >
              {table.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Active Data Table */}
      <div className="bg-card border border-border rounded-[32px] overflow-hidden p-8 shadow-sm">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Inspection Data: <span className="text-accent">{selectedTable.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
            </h2>
          </div>

          <div className="hidden md:block">
            {/* Vessel selector removed per request */}
          </div>
        </div>
        
        <div className="min-h-[400px]">
          <InspectionTable 
            tableName={selectedTable} 
            vesselId={selectedVessel || (vessels[0]?.id)} 
            vesselName={currentVessel?.vessel_name || currentVessel?.vesselName}
          />

        </div>
      </div>

      {/* Admin Review Section Removed */}

    </div>
  );
}
