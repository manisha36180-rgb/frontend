import axios from 'axios';
import { supabase } from '@/lib/supabase';

const EDGE_FUNCTION_URL = process.env.NEXT_PUBLIC_VESSEL_API_URL || 'https://dobpdssgdfaiharnmpdf.supabase.co/functions/v1/vessel-api';



const api = axios.create({
  baseURL: EDGE_FUNCTION_URL,
  headers: {
    'Content-Type': 'application/json',
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('supabase-token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  register: (data: any) => axios.post('https://dobpdssgdfaiharnmpdf.supabase.co/functions/v1/admin-api', data, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('supabase-token')}`,
      'Content-Type': 'application/json'
    }
  }).then(res => res.data),
};

// Reports

export const reportsApi = {
  getAll: () => api.get('/api/reports').then(res => res.data),
  getOne: (id: string) => api.get(`/api/reports/${id}`).then(res => res.data),
  create: (data: any) => api.post('/api/reports', data).then(res => res.data),
  approve: (id: string) => api.put(`/api/reports/${id}/approve`).then(res => res.data),
  delete: (id: string) => api.delete(`/api/reports/${id}`).then(res => res.data),
};

// Vessels
export const vesselsApi = {
  getAll: () => api.get('/api/vessels').then(res => res.data),
  getOne: (id: string) => api.get(`/api/vessels/${id}`).then(res => res.data),
  create: (data: any) => api.post('/api/vessels', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/api/vessels/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/api/vessels/${id}`).then(res => res.data),
};

export const getTableData = async (tableName: string, vesselId?: string | null) => {
  if (!vesselId) return [];
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('vessel_id', vesselId)
    .order('s_no', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const updateTableRow = async (tableName: string, rowId: string | number, data: any) => {
  const { data: updated, error } = await supabase
    .from(tableName)
    .update(data)
    .eq('id', rowId)
    .select();
  
  if (error) throw error;
  return updated[0];
};

export default api;

