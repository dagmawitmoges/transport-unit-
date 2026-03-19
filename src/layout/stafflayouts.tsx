import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  ClipboardCheck,
  Truck,
  Car,
  LogOut,
  Menu,
  ChevronLeft,
} from 'lucide-react';

const allNavItems = [
  {
    label: 'Dashboard',
    to: '/staff/dashboard',
    icon: LayoutDashboard,
    roles: ['requester', 'dispatcher', 'dispatcher_supervisor', 'supervisor', 'director', 'driver'],
  },
  { label: 'New Request', to: '/staff/request',  icon: PlusCircle,     roles: ['requester'] },
  { label: 'My Requests', to: '/staff/requests', icon: FileText,       roles: ['requester'] },
  { label: 'Review',      to: '/staff/review',   icon: ClipboardCheck, roles: ['supervisor', 'director'] },
  { label: 'Dispatch',    to: '/staff/dispatch', icon: Truck,          roles: ['dispatcher', 'dispatcher_supervisor'] },
  { label: 'My Trips',    to: '/staff/trips',    icon: Car,            roles: ['driver'] },
];

const roleLabels: Record<string, string> = {
  requester:             'Requester',
  dispatcher:            'Dispatcher',
  dispatcher_supervisor: 'Dispatch Supervisor',
  supervisor:            'Supervisor',
  director:              'Director',
  driver:                'Driver',
};

export const StaffLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = allNavItems.filter(
    (item) => user?.role && item.roles.includes(user.role)
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0f4f0' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300 ease-in-out"
        style={{
          width: collapsed ? '72px' : '240px',
          background: 'linear-gradient(180deg, #005a2d 0%, #006233 60%, #004d27 100%)',
          boxShadow: '4px 0 24px rgba(0,98,51,0.18)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 min-h-[68px]">
          <div
            className="flex items-center justify-center shrink-0 rounded-xl"
            style={{ width: 40, height: 40, background: 'rgba(255,193,7,0.18)', border: '1.5px solid rgba(255,193,7,0.4)' }}
          >
            <Truck size={20} style={{ color: '#FFC107' }} />
          </div>
          {!collapsed && (
            <div>
              <p className="font-bold text-white text-sm tracking-wide">Transport MS</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>AU Staff Portal</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {!collapsed && (
            <p className="text-xs font-semibold px-3 mb-3 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Menu
            </p>
          )}
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={({ isActive }) => isActive ? {
                background: 'rgba(255,193,7,0.15)',
                color: '#FFC107',
                borderLeft: '3px solid #FFC107',
              } : {
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className="shrink-0" style={{ color: isActive ? '#FFC107' : undefined }} />
                  {!collapsed && <span>{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-white/10 p-3 space-y-1">
          {!collapsed && (
            <div className="px-3 py-2 rounded-xl mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-semibold text-white truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {roleLabels[user?.role ?? ''] ?? user?.role}
              </p>
            </div>
          )}
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-200 hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b px-6 py-3.5 flex items-center justify-between shrink-0" style={{ borderColor: '#e5ede8' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            >
              {collapsed ? <Menu size={20} className="text-gray-500" /> : <ChevronLeft size={20} className="text-gray-500" />}
            </button>
            <div>
              <h1 className="text-sm font-semibold text-gray-800">Welcome back, {user?.first_name} 👋</h1>
              <p className="text-xs text-gray-400">AU Transport Management System</p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold capitalize"
            style={{ background: 'rgba(0,98,51,0.08)', color: '#006233' }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#006233' }}></span>
            {roleLabels[user?.role ?? ''] ?? user?.role}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};