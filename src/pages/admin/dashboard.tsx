import { useEffect, useState } from 'react';
import { AdminLayout } from '../../layout/adminLayout';
import { getUsers, getTransportRequests } from '../../api/admin';
import { getVehicles } from '../../api/vehicles';
import {
  Users, FileText, UserCheck, UserX, Car,
  TrendingUp, Clock, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Legend,
} from 'recharts';

const AU_GREEN  = '#006233';
const AU_GOLD   = '#FFC107';
const AU_LIGHT  = '#e8f5ee';

const STATUS_COLORS: Record<string, string> = {
  pending:   '#FFC107',
  approved:  '#22c55e',
  rejected:  '#ef4444',
  assigned:  '#3b82f6',
  completed: '#6b7280',
  cancelled: '#f97316',
};

const DEPT_COLORS = ['#006233','#FFC107','#3b82f6','#22c55e','#f97316','#8b5cf6','#ef4444','#06b6d4','#ec4899','#14b8a6','#f59e0b'];

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  loading: boolean;
  trend?: string;
}

const StatCard = ({ label, value, icon, iconBg, iconColor, loading, trend }: StatCardProps) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border flex items-center gap-4" style={{ borderColor: '#e5ede8', borderLeft: `4px solid ${iconColor}` }}>
    <div className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0" style={{ background: iconBg }}>
      <span style={{ color: iconColor }}>{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
      {loading ? (
        <Loader2 size={18} className="animate-spin text-gray-300 mt-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      )}
      {trend && !loading && (
        <p className="text-xs mt-0.5" style={{ color: AU_GREEN }}>{trend}</p>
      )}
    </div>
  </div>
);

export const AdminDashboard = () => {
  const [users, setUsers]       = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, r, v] = await Promise.all([
          getUsers(),
          getTransportRequests(),
          getVehicles(),
        ]);
        setUsers(Array.isArray(u) ? u : u.data ?? []);
        setRequests(Array.isArray(r) ? r : r.data ?? []);
        setVehicles(Array.isArray(v) ? v : v.data ?? []);
      } catch (err: any) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeUsers   = users.filter((u) => u.active !== false).length;
  const inactiveUsers = users.filter((u) => u.active === false).length;

  // Requests by status for pie chart
  const statusCounts = ['pending', 'approved', 'rejected', 'assigned', 'completed', 'cancelled'].map((s) => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: requests.filter((r) => r.status === s).length,
    color: STATUS_COLORS[s],
  })).filter((s) => s.value > 0);

  // Requests by department for bar chart
  const deptMap: Record<string, number> = {};
  requests.forEach((r) => {
    const dept = r.department?.code ?? r.department?.name ?? 'Unknown';
    deptMap[dept] = (deptMap[dept] ?? 0) + 1;
  });
  const deptData = Object.entries(deptMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Requests over time (last 7 days)
  const timeData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en', { weekday: 'short' });
    return {
      day: label,
      requests: requests.filter((r) => r.created_at?.startsWith(dateStr)).length,
    };
  });

  // Vehicle utilization
  const availableVehicles   = vehicles.filter((v) => v.status === 'available').length;
  const inUseVehicles       = vehicles.filter((v) => v.status === 'in_use').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'maintenance').length;
  const vehicleData = [
    { name: 'Available',    value: availableVehicles,   color: '#22c55e' },
    { name: 'In Use',       value: inUseVehicles,       color: '#3b82f6' },
    { name: 'Maintenance',  value: maintenanceVehicles, color: '#FFC107' },
  ].filter((v) => v.value > 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-sm text-gray-500 mt-0.5">AU Transport System — Overview</p>
          </div>
          <div className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-lg border" style={{ borderColor: '#e5ede8' }}>
            {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Users"        value={users.length}    icon={<Users size={22} />}       iconBg="rgba(0,98,51,0.1)"   iconColor={AU_GREEN}  loading={loading} />
          <StatCard label="Active Users"       value={activeUsers}     icon={<UserCheck size={22} />}   iconBg="rgba(34,197,94,0.1)" iconColor="#22c55e"   loading={loading} />
          <StatCard label="Inactive Users"     value={inactiveUsers}   icon={<UserX size={22} />}       iconBg="rgba(239,68,68,0.1)" iconColor="#ef4444"   loading={loading} />
          <StatCard label="Total Requests"     value={requests.length} icon={<FileText size={22} />}    iconBg="rgba(255,193,7,0.1)" iconColor={AU_GOLD}   loading={loading} />
          <StatCard label="Total Vehicles"     value={vehicles.length} icon={<Car size={22} />}         iconBg="rgba(59,130,246,0.1)" iconColor="#3b82f6"  loading={loading} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Requests by Status — Donut */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: '#e5ede8' }}>
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FileText size={16} style={{ color: AU_GREEN }} /> Requests by Status
            </h3>
            {loading ? (
              <div className="flex items-center justify-center h-48"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
            ) : statusCounts.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-300 text-sm">No data yet</div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={160}>
                  <PieChart>
                    <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {statusCounts.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any, n: any) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {statusCounts.map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: s.color }}></span>
                        <span className="text-gray-600">{s.name}</span>
                      </div>
                      <span className="font-semibold text-gray-800">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Utilization — Donut */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: '#e5ede8' }}>
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Car size={16} style={{ color: AU_GREEN }} /> Vehicle Utilization
            </h3>
            {loading ? (
              <div className="flex items-center justify-center h-48"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
            ) : vehicleData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-300 text-sm">No vehicles</div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={160}>
                  <PieChart>
                    <Pie data={vehicleData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {vehicleData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {vehicleData.map((v) => (
                    <div key={v.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: v.color }}></span>
                        <span className="text-gray-600">{v.name}</span>
                      </div>
                      <span className="font-semibold text-gray-800">{v.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border space-y-3" style={{ borderColor: '#e5ede8' }}>
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <TrendingUp size={16} style={{ color: AU_GREEN }} /> Quick Stats
            </h3>
            {[
              { label: 'Pending Approval', value: requests.filter(r => r.status === 'pending').length,   icon: <Clock size={14} />,       color: '#FFC107', bg: 'rgba(255,193,7,0.1)' },
              { label: 'Approved',         value: requests.filter(r => r.status === 'approved').length,  icon: <CheckCircle size={14} />, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
              { label: 'Rejected',         value: requests.filter(r => r.status === 'rejected').length,  icon: <XCircle size={14} />,     color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
              { label: 'Assigned',         value: requests.filter(r => r.status === 'assigned').length,  icon: <Car size={14} />,         color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
              { label: 'Completed',        value: requests.filter(r => r.status === 'completed').length, icon: <CheckCircle size={14} />, color: AU_GREEN,  bg: 'rgba(0,98,51,0.1)' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: stat.bg }}>
                <div className="flex items-center gap-2 text-xs font-medium" style={{ color: stat.color }}>
                  {stat.icon} {stat.label}
                </div>
                <span className="text-sm font-bold" style={{ color: stat.color }}>
                  {loading ? '—' : stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Requests over time */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: '#e5ede8' }}>
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp size={16} style={{ color: AU_GREEN }} /> Requests — Last 7 Days
            </h3>
            {loading ? (
              <div className="flex items-center justify-center h-48"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="requests" stroke={AU_GREEN} strokeWidth={2.5} dot={{ fill: AU_GREEN, r: 4 }} activeDot={{ r: 6, fill: AU_GOLD }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Requests by Department */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: '#e5ede8' }}>
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Users size={16} style={{ color: AU_GREEN }} /> Requests by Department
            </h3>
            {loading ? (
              <div className="flex items-center justify-center h-48"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
            ) : deptData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-300 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={deptData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Requests" radius={[4, 4, 0, 0]}>
                    {deptData.map((_, i) => (
                      <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Requests Table */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#e5ede8' }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#e5ede8' }}>
            <h3 className="font-semibold text-gray-700">Recent Transport Requests</h3>
            <span className="text-xs text-gray-400">{requests.length} total</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin" style={{ color: AU_GREEN }} />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No transport requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: '#f7faf8' }}>
                  <tr>
                    {['ID', 'Requester', 'Destination', 'Department', 'Date', 'Status'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#f0f4f0' }}>
                  {requests.slice(0, 8).map((req: any) => (
                    <tr key={req.id} className="hover:bg-green-50/30 transition-colors">
                      <td className="px-6 py-3.5 text-gray-400 text-xs font-mono">#{req.id}</td>
                      <td className="px-6 py-3.5 font-medium text-gray-800">
                        {req.requester ? `${req.requester.first_name} ${req.requester.last_name}` : '—'}
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">{req.destination ?? '—'}</td>
                      <td className="px-6 py-3.5 text-gray-500">{req.department?.code ?? '—'}</td>
                      <td className="px-6 py-3.5 text-gray-500">{req.required_date ?? '—'}</td>
                      <td className="px-6 py-3.5">
                        <span
                          className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                          style={{
                            background: STATUS_COLORS[req.status] ? `${STATUS_COLORS[req.status]}18` : '#f3f4f6',
                            color: STATUS_COLORS[req.status] ?? '#6b7280',
                          }}
                        >
                          {req.status ?? 'unknown'}
                        </span>
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