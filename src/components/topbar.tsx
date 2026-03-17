import { LogOut, User } from 'lucide-react';
import { useAuth } from '../auth/authContext';

export const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="h-16 bg-white/50 backdrop-blur-md fixed top-0 right-0 left-64 shadow-sm z-10">
      <div className="h-full px-8 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User size={20} className="text-gray-600" />
          <span className="text-gray-700 font-medium">{user?.full_name}</span>
          <span className="text-sm text-gray-500">({user?.role})</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/70 hover:bg-white text-gray-700 hover:shadow-md transition-all"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
