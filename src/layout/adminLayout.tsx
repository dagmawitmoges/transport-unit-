import type{ ReactNode } from 'react';
import { Sidebar } from '../components/sidebar';
import { Topbar } from '../components/topbar';
import {
  LayoutDashboard,
  Users,
  FileText,
  Shield,
  Building,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/reports', label: 'Reports', icon: FileText },
  { path: '/admin/roles', label: 'Roles', icon: Shield },
  { path: '/admin/departments', label: 'Departments', icon: Building },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Sidebar items={sidebarItems} />
      <Topbar />
      <main className="ml-64 pt-16">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
