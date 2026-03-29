import { Loader2 } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}

export const StatCard = ({ label, value, icon, color, loading }: StatCardProps) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md hover:scale-[1.02] transition-transform">
    <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      {loading ? (
        <Loader2 size={20} className="animate-spin text-gray-400 mt-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      )}
    </div>
  </div>
);
