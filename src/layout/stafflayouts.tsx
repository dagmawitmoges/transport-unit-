import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  ClipboardCheck,
  LogOut,
  Menu,
  X,
  Truck,
} from 'lucide-react';

const allNavItems = [
  { label: 'Dashboard',   to: '/staff/dashboard', icon: LayoutDashboard, roles: ['requester', 'dispatcher', 'dispatcher_supervisor', 'supervisor', 'director', 'driver'] },
  { label: 'New Request', to: '/staff/request',   icon: PlusCircle,      roles: ['requester'] },
  { label: 'My Requests', to: '/staff/requests',  icon: FileText,        roles: ['requester'] },
  { label: 'Review',      to: '/staff/review',    icon: ClipboardCheck,  roles: ['supervisor', 'director'] },
];

export const StaffLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = allNavItems.filter(
    (item) => user?.role && item.roles.includes(user.role)
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out shrink-0`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700 min-h-[64px]">
          <div className="flex items-center justify-center w-9 h-9 bg-blue-500 rounded-lg shrink-0">
            <Truck size={20} className="text-white" />
          </div>
          {!collapsed && <span className="font-bold text-base tracking-tight whitespace-nowrap">Transport MS</span>}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-700 p-3 space-y-1">
          {!collapsed && (
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-white truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role?.replace(/_/g, ' ')}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shrink-0">
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
          <h1 className="text-sm font-semibold text-gray-700">Welcome back, {user?.first_name} 👋</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};