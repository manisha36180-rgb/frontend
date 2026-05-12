'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Ship, Anchor, Globe, ChevronLeft, MapPin, Calendar, ClipboardList } from 'lucide-react';
import { mockVessels } from '@/lib/mock-data';
import { supabase } from '@/lib/supabase';

export default function VesselDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [vessel, setVessel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVessel();
  }, [params.id]);

  const fetchVessel = async () => {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (error) throw error;
      setVessel(data);
    } catch (error) {
      console.error('Failed to fetch vessel:', error);
      const mock = mockVessels.find(v => v.id === params.id);
      setVessel(mock);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading Vessel Details...</div>;
  if (!vessel) return <div className="p-8 text-center">Vessel not found.</div>;

  return (
    <div className="space-y-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-accent transition-colors mb-4"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Fleet
      </button>

      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden">
        <div className="bg-accent/10 p-8 flex items-center gap-6">
          <div className="w-20 h-20 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-xl shadow-accent/10">
            <Ship className="w-10 h-10 text-accent" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">{vessel.vesselName || vessel.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                <Globe className="w-4 h-4" /> {vessel.flag || 'N/A'}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                <Anchor className="w-4 h-4" /> IMO: {vessel.imoNumber}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Technical Specs</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">Type:</span> <span className="font-bold">{vessel.vesselType || vessel.type}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status:</span> <span className="text-emerald-500 font-bold">{vessel.status || 'ACTIVE'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
