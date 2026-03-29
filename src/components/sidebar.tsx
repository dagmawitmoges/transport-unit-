import { NavLink } from 'react-router-dom';
import type{ LucideIcon} from 'lucide-react';

interface SidebarItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
}

export const Sidebar = ({ items }: SidebarProps) => {
  return (
    <div className="w-64 bg-white/50 backdrop-blur-md h-screen fixed left-0 top-0 shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Transport MS
        </h1>
      </div>

      <nav className="px-4 space-y-2">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-white/70 hover:shadow-sm'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-600'} />
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
