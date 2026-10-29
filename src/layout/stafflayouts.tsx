import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import { useSidebar } from './useSidebar';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  ClipboardCheck,
  Truck,
  BarChart3,
  LogOut,
  Menu,
  X,
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
  { label: 'Reports',     to: '/staff/reports',  icon: BarChart3,      roles: ['dispatcher', 'dispatcher_supervisor'] },
  { label: 'My Trips',    to: '/staff/trips',    icon: Truck,          roles: ['driver'] },
];

export const StaffLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { collapsed, mobileOpen, toggle, closeMobile } = useSidebar();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = allNavItems.filter(
    (item) => user?.role && item.roles.includes(user.role)
  );

  // Labels hide only when the desktop sidebar is collapsed; the mobile drawer always shows them.
  const hideLabel = collapsed ? 'md:hidden' : '';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:translate-x-0 ${
          collapsed ? 'md:w-16' : 'md:w-64'
        } bg-[#0f2f2a] text-white flex flex-col transition-all duration-300 ease-in-out shrink-0`}
      >
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700 min-h-[64px]">
          <div className="flex items-center justify-center w-9 h-9 bg-white rounded-lg shrink-0">
            <img src="/au-logo.png" alt="African Union" className="w-6 h-6 object-contain" />
          </div>
          <span className={`font-bold text-base tracking-tight whitespace-nowrap flex-1 ${hideLabel}`}>AU Transport</span>
          <button
            onClick={closeMobile}
            className="md:hidden p-1.5 rounded-lg text-white/70 hover:bg-white/10"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className={hideLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-700 p-3 space-y-1">
          <div className={`px-3 py-2 ${hideLabel}`}>
            <p className="text-xs font-semibold text-white truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.replace(/_/g, ' ')}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={18} className="shrink-0" />
            <span className={hideLabel}>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 shrink-0">
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-sm font-semibold text-gray-700 truncate">Welcome back, {user?.first_name} 👋</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};
