import axios from 'axios';
import { supabase } from '@/lib/supabase';

const EDGE_FUNCTION_BASE_URL = 'https://dobpdssgdfaiharnmpdf.supabase.co/functions/v1';
const EDGE_FUNCTION_URL = process.env.NEXT_PUBLIC_VESSEL_API_URL || `${EDGE_FUNCTION_BASE_URL}/vessels-api`;



// Instances for specific functions
const vesselsInstance = axios.create({
  baseURL: `${EDGE_FUNCTION_BASE_URL}/vessels-api`,
  headers: {
    'Content-Type': 'application/json',
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
});

const reportsInstance = axios.create({
  baseURL: `${EDGE_FUNCTION_BASE_URL}/dynamic-endpoint`,
  headers: {
    'Content-Type': 'application/json',
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
});

// Add interceptors to both
[vesselsInstance, reportsInstance].forEach(instance => {
  instance.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('supabase-token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
});

// Auth
export const authApi = {
  register: (data: any) => axios.post(`${EDGE_FUNCTION_BASE_URL}/admin-api`, data, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('supabase-token')}`,
      'Content-Type': 'application/json',
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  }).then(res => res.data),
};

// Reports (using dynamic-endpoint)
export const reportsApi = {
  getAll: () => reportsInstance.get('', { params: { table: 'reports' } }).then(res => res.data),
  getOne: (id: string) => reportsInstance.get('', { params: { table: 'reports', id } }).then(res => res.data),
  create: (data: any) => reportsInstance.post('', { table: 'reports', data }).then(res => res.data),
  approve: (id: string) => reportsInstance.post('', { table: 'reports', data: { id, status: 'APPROVED' } }).then(res => res.data),
  delete: (id: string) => reportsInstance.post('', { table: 'reports', deleteId: id }).then(res => res.data),
};

// Vessels (using vessels-api)
export const vesselsApi = {
  getAll: () => vesselsInstance.get('/').then(res => res.data),
  getOne: (id: string) => vesselsInstance.get(`/${id}`).then(res => res.data),
  create: (data: any) => vesselsInstance.post('/', data).then(res => res.data),
  update: (id: string, data: any) => vesselsInstance.put(`/${id}`, data).then(res => res.data),
  delete: (id: string) => vesselsInstance.delete(`/${id}`).then(res => res.data),
};

export const getTableData = async (tableName: string, vesselId?: string | null) => {
  try {
    const response = await axios.get(`${EDGE_FUNCTION_BASE_URL}/dynamic-endpoint`, {
      params: { table: tableName, vesselId: vesselId },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('supabase-token')}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching table data via edge function:', error);
    throw error;
  }
};

export const updateTableRow = async (tableName: string, rowId: string | number, data: any) => {
  try {
    const response = await axios.post(`${EDGE_FUNCTION_BASE_URL}/dynamic-endpoint`, {
      table: tableName,
      data: { ...data, id: rowId }
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('supabase-token')}`,
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating table row via edge function:', error);
    throw error;
  }
};

export default vesselsInstance;

