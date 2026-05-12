export type Role = 'ADMIN' | 'USER' | 'SUPERINTENDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Vessel {
  id: string;
  name: string;
  imoNumber: string;
  type: string;
  flag: string;
  builtYear: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Report {
  id: string;
  vesselId: string;
  vesselName: string;
  inspectorName: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  location: string;
  summary: string;
  findings: Finding[];
  attachments: string[];
}

export interface Finding {
  id: string;
  category: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'CLOSED';
}

export interface DashboardStats {
  totalVessels: number;
  totalReports: number;
  pendingApprovals: number;
  approvedReports: number;
}
