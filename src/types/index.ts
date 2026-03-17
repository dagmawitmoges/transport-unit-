export type Role = 'admin' | 'transport_manager' | 'driver' | 'employee';

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  department: string;
  status: UserStatus;
  created_at: string;
}

export interface AuthUser {
  id: string;
  full_name: string;
  role: Role;
  email: string;
  department: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface TransportRequest {
  id: string;
  user_id: string;
  user_name: string;
  pickup_location: string;
  destination: string;
  date: string;
  time: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface RoleOption {
  id: Role;
  name: string;
}

export interface DashboardStats {
  total_users: number;
  active_users: number;
  drivers: number;
  requests: number;
}

export interface ReportData {
  users_by_department: { department: string; count: number }[];
  requests_by_department: { department: string; count: number }[];
  requests_over_time: { date: string; count: number }[];
  total_requests: number;
  approved_requests: number;
  rejected_requests: number;
  pending_requests: number;
}
