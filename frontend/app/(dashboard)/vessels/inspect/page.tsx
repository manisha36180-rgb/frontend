'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Ship, ArrowLeft, Download, CheckCircle2 } from 'lucide-react';
import InspectionTable from '@/components/InspectionTable';
import { supabase } from '@/lib/supabase';
import { vesselsApi } from '@/services/api';


export default function InspectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vesselId = searchParams.get('vesselId');
  const category = searchParams.get('category');
  const [vessel, setVessel] = useState<any>(null);

  useEffect(() => {
    if (vesselId) fetchVessel();
  }, [vesselId]);

  const fetchVessel = async () => {
    try {
      const data = await vesselsApi.getOne(vesselId!);
      if (data) setVessel(data);
    } catch (error) {
      console.error('Failed to fetch vessel:', error);
    }
  };


  if (!vesselId || !category) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold">Invalid Inspection Parameters</h1>
        <button onClick={() => router.back()} className="mt-4 text-accent font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </div>
              {category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </h1>
            <p className="text-slate-500 mt-1">Detailed report for vessel: {vessel?.vessel_name || vessel?.vesselName || vessel?.name || 'Loading...'}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20">
            <Download className="w-4 h-4" />
            Export Category Data
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden p-6 shadow-sm">
        <InspectionTable 
          tableName={category} 
          vesselId={vesselId}
          vesselName={vessel?.vessel_name || vessel?.vesselName || vessel?.name}
        />

      </div>
    </div>
  );
}
