import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import { useSidebar } from './useSidebar';
import {
  LayoutDashboard,
  Users,
  Car,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Vehicles', to: '/admin/vehicles', icon: Car },
  { label: 'Requests', to: '/admin/requests', icon: FileText },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
];

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { collapsed, mobileOpen, toggle, closeMobile } = useSidebar();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Labels hide only when the desktop sidebar is collapsed; the mobile drawer always shows them.
  const hideLabel = collapsed ? 'md:hidden' : '';

  return (
    <div className="flex h-screen bg-[#f6f9f8] overflow-hidden">

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* 🌿 SIDEBAR (drawer on mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:translate-x-0 ${
          collapsed ? 'md:w-20' : 'md:w-64'
        } bg-[#0f2f2a] text-white flex flex-col shrink-0 transition-all duration-300`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-md shrink-0">
            <img src="/au-logo.png" alt="African Union" className="w-7 h-7 object-contain" />
          </div>
          <span className={`font-semibold text-lg tracking-tight flex-1 ${hideLabel}`}>
            AU Transport
          </span>
          <button
            onClick={closeMobile}
            className="md:hidden p-1.5 rounded-lg text-white/70 hover:bg-white/10"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-[#1f5c52] text-white shadow'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className={hideLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-3">
          <div className={`mb-3 px-2 ${hideLabel}`}>
            <p className="text-sm font-semibold truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-white/60 capitalize">
              {user?.role}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <LogOut size={18} className="shrink-0" />
            <span className={hideLabel}>Logout</span>
          </button>
        </div>
      </aside>

      {/* 🌿 MAIN */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* 🔝 TOPBAR */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3 shadow-sm shrink-0">

          {/* Left */}
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition shrink-0"
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0">
              <p className="text-xs text-gray-400">Welcome back</p>
              <h1 className="text-sm font-semibold text-gray-700 truncate">
                {user?.first_name} 👋
              </h1>
            </div>
          </div>

          {/* Right (Profile) */}
          <div className="flex items-center gap-3 shrink-0">
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
