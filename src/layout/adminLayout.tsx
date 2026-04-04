import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import {
  LayoutDashboard,
  Users,
  Car,
  FileText,
  LogOut,
  Menu,
  ChevronLeft,
  
} from 'lucide-react';
import auLogo from '../../public/au.jfif';
const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users',     to: '/admin/users',     icon: Users },
  { label: 'Vehicles',  to: '/admin/vehicles',  icon: Car },
  { label: 'Requests',  to: '/admin/requests',  icon: FileText },
];

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

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
          <img
  src={auLogo}
  alt="AU Logo"
  className="shrink-0 rounded-lg object-cover"
  style={{ width: 40, height: 40 }}
/>
          {!collapsed && (
            <div>
              <p className="font-bold text-white text-sm tracking-wide">Transport MS</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>AU Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {!collapsed && (
            <p className="text-xs font-semibold px-3 mb-3 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Main Menu
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
              <p className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.45)' }}>{user?.role}</p>
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(0,98,51,0.08)', color: '#006233' }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#006233' }}></span>
            Admin
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};