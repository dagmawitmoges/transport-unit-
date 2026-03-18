import { useEffect, useState } from 'react';
import { AdminLayout } from '../../layout/adminLayout';
import { getUsers, getTransportRequests } from '../../api/admin';
import { Users, FileText, UserCheck, UserX, Loader2 } from 'lucide-react';
import { StatCard } from '../../components/statCard';
import { StatusBadge } from '../../components/StatusBadge';

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

  return (
  <AdminLayout>
    <div className="p-6 space-y-6">
      
      {/* 🔝 HEADER */}
      <div>
        <p className="text-sm text-gray-400">Overview</p>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* 🌿 WELCOME CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome back, Admin 👋
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Here’s what’s happening in your transport system today.
            </p>
          </div>

          {/* 🌿 ACTION CARD */}
          <div className="bg-gradient-to-r from-[#1f5c52] to-[#2f7d70] text-white rounded-2xl p-6 shadow">
            <h3 className="text-lg font-semibold">Quick Action</h3>
            <p className="mt-2 text-sm opacity-90">
              Review and approve pending transport requests
            </p>
            <button className="mt-4 bg-white text-[#1f5c52] px-4 py-2 rounded-lg text-sm font-medium">
              Go to Requests
            </button>
          </div>

          {/* 🌿 TABLE */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-700">
                Recent Transport Requests
              </h3>
              <span className="text-xs text-gray-400">
                Showing latest {requests.length}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-[#1f5c52]" />
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
                      <th className="px-6 py-3 text-left">ID</th>
                      <th className="px-6 py-3 text-left">Destination</th>
                      <th className="px-6 py-3 text-left">Purpose</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {requests.slice(0, 6).map((req: any) => (
                      <tr
                        key={req.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-gray-400">
                          #{req.id}
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-800">
                          {req.destination ?? '—'}
                        </td>

                        <td className="px-6 py-4 text-gray-500 truncate max-w-xs">
                          {req.purpose ?? '—'}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={req.status} />
                        </td>

                        <td className="px-6 py-4 text-gray-400">
                          {req.required_date ??
                            req.created_at?.split('T')[0] ??
                            '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT (STATS) */}
        <div className="space-y-4">
          
          <StatCard
            label="Total Users"
            value={users.length}
            icon={<Users size={20} className="text-[#1f5c52]" />}
            color="bg-[#e6f4f1]"
            loading={loading}
          />

          <StatCard
            label="Requests"
            value={requests.length}
            icon={<FileText size={20} className="text-[#2f7d70]" />}
            color="bg-[#eaf7f4]"
            loading={loading}
          />

          <StatCard
            label="Active Users"
            value={activeUsers}
            icon={<UserCheck size={20} className="text-green-600" />}
            color="bg-green-50"
            loading={loading}
          />

          <StatCard
            label="Inactive Users"
            value={inactiveUsers}
            icon={<UserX size={20} className="text-red-500" />}
            color="bg-red-50"
            loading={loading}
          />

        </div>
      </div>
    </div>
  </AdminLayout>
);}