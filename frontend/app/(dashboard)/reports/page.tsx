'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FilePlus, 
  Plus,
  Search, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Paperclip,
  Ship
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ALL');
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          vessel:vessels(*)
        `)
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reports.length) return;
    const headers = ['ID', 'Vessel', 'Date', 'Status', 'Category'];
    const rows = reports.map(r => [
      r.id, 
      r.vessel?.vesselName || 'N/A', 
      new Date(r.inspectionDate).toLocaleDateString(), 
      r.status,
      r.category || 'N/A'
    ]);
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

  const deleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      const { error } = await supabase.from('reports').delete().eq('id', id);
      if (error) throw error;
      fetchReports();
    } catch (error) {
      alert('Failed to delete report: ' + (error as any).message);
    }
  };

  const filteredReports = reports
    .filter(r => activeTab === 'ALL' || r.status === activeTab)
    .filter(r => (r.vessel?.vesselName || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inspection Reports</h1>
          <p className="text-slate-500 mt-1">Manage and audit finalized vessel inspection logs from Supabase.</p>
        </div>
        <button 
          onClick={() => router.push('/vessels')}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all shadow-xl shadow-accent/20"
        >
          <Plus className="w-5 h-5" />
          New Inspection
        </button>
      </div>

      {/* Content Removed - Page Left Empty as Requested */}
      <div className="flex items-center justify-center py-40">
        <p className="text-[#94A3B8] font-bold uppercase tracking-widest text-xs opacity-20">Workspace Empty</p>
      </div>
    </div>
  );
}
