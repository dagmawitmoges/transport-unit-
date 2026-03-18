import { useEffect, useState } from 'react';
import { AdminLayout } from '../../layout/adminLayout';
import { getUsers, getTransportRequests } from '../../api/admin';
import { Users, FileText, UserCheck, UserX, Loader2 } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}

const StatCard = ({ label, value, icon, color, loading }: StatCardProps) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
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

export const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, requestsData] = await Promise.all([
          getUsers(),
          getTransportRequests(),
        ]);

        // Handle both array responses and paginated { data: [] } responses
        setUsers(Array.isArray(usersData) ? usersData : usersData.data ?? []);
        setRequests(Array.isArray(requestsData) ? requestsData : requestsData.data ?? []);
      } catch (err: any) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeUsers   = users.filter((u) => u.active !== false).length;
  const inactiveUsers = users.filter((u) => u.active === false).length;

  const stats = [
    {
      label: 'Total Users',
      value: users.length,
      icon: <Users size={22} className="text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      label: 'Transport Requests',
      value: requests.length,
      icon: <FileText size={22} className="text-purple-600" />,
      color: 'bg-purple-50',
    },
    {
      label: 'Active Users',
      value: activeUsers,
      icon: <UserCheck size={22} className="text-green-600" />,
      color: 'bg-green-50',
    },
    {
      label: 'Inactive Users',
      value: inactiveUsers,
      icon: <UserX size={22} className="text-red-500" />,
      color: 'bg-red-50',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Overview of your transport system</p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} loading={loading} />
          ))}
        </div>

        {/* Recent Requests Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700">Recent Transport Requests</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              No transport requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">ID</th>
                    <th className="px-6 py-3 text-left font-medium">Destination</th>
                    <th className="px-6 py-3 text-left font-medium">Purpose</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.slice(0, 8).map((req: any) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">#{req.id}</td>
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {req.destination ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                        {req.purpose ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {req.required_date ?? req.created_at?.split('T')[0] ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  assigned:  'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-50 text-red-400',
};

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
      statusColors[status] ?? 'bg-gray-100 text-gray-500'
    }`}
  >
    {status ?? 'unknown'}
  </span>
);
console.log('TOKEN:', localStorage.getItem('token'));