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
  X,
  Truck,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Vehicles', to: '/admin/vehicles', icon: Car },
  { label: 'Requests', to: '/admin/requests', icon: FileText },
];

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f6f9f8] overflow-hidden">
      
      {/* 🌿 SIDEBAR */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } bg-[#0f2f2a] text-white flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="flex items-center justify-center w-10 h-10 bg-[#1f5c52] rounded-xl shadow-md">
            <Truck size={20} className="text-white" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-lg tracking-tight">
              Transport
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-[#1f5c52] text-white shadow'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-3">
          {!collapsed && (
            <div className="mb-3 px-2">
              <p className="text-sm font-semibold">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-white/60 capitalize">
                {user?.role}
              </p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* 🌿 MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 🔝 TOPBAR */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
          
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {collapsed ? <Menu size={20} /> : <X size={20} />}
            </button>

            <div>
              <p className="text-xs text-gray-400">Welcome back</p>
              <h1 className="text-sm font-semibold text-gray-700">
                {user?.first_name} 👋
              </h1>
            </div>
          </div>

          {/* Right (Profile) */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-700">
                {user?.first_name}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {user?.role}
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#1f5c52] flex items-center justify-center text-white font-semibold shadow">
              {user?.first_name?.charAt(0)}
            </div>
          </div>
        </header>

        {/* 📄 CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};