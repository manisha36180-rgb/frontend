'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, ChevronLeft, Calendar, User, Ship, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function ReportDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [params.id]);

  const fetchReport = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          vessel:vessels(*)
        `)
        .eq('id', params.id)
        .single();
      
      if (error) throw error;
      setReport(data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading Report...</div>;
  if (!report) return <div className="p-8 text-center">Report not found.</div>;

  return (
    <div className="space-y-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-accent transition-colors mb-4"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Reports
      </button>

      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden">
        <div className="p-8 flex items-center justify-between border-b dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{report.title || 'Inspection Report'}</h1>
              <p className="text-slate-500">#{report.id}</p>
            </div>
          </div>
          <span className={cn(
            "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest",
            report.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
          )}>
            {report.status}
          </span>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="font-bold text-lg">Report Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Ship className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Vessel</p>
                  <p className="font-semibold">{report.vessel?.vesselName || report.vesselName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Date</p>
                  <p className="font-semibold">{new Date(report.inspectionDate || report.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
