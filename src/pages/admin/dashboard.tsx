import { useEffect, useState } from 'react';
import { AdminLayout } from '../../layout/adminLayout';
import { getUsers, getTransportRequests } from '../../api/admin';
import { getVehicles } from '../../api/vehicles';
import * as XLSX from 'xlsx';
import {
  Users, FileText, UserCheck, Car,
  TrendingUp, Clock, CheckCircle, XCircle,
  Loader2, Download, X,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';

const AU_GREEN      = '#006233';
const AU_GOLD       = '#FFC107';
const AU_GREEN_DARK = '#004d27';
const AU_GREEN_MID  = '#007a3d';
const AU_GREEN_LITE = '#4caf7d';
const AU_RED        = '#c0392b';
const AU_GRAY       = '#78909c';

const STATUS_COLORS: Record<string, string> = {
  pending:   AU_GOLD,
  approved:  AU_GREEN_MID,
  rejected:  AU_RED,
  assigned:  AU_GREEN_LITE,
  completed: AU_GREEN_DARK,
  cancelled: AU_GRAY,
};

const DEPT_SHADES = [
  '#006233', '#007a3d', '#009249', '#00aa55',
  '#33bb77', '#66cc99', '#99ddbb', '#cceecc',
];

const StatCard = ({ label, value, icon, loading }: any) => (
  <div
    className="bg-white rounded-2xl p-5 shadow-sm border flex items-center gap-4"
    style={{ borderColor: '#e5ede8', borderLeft: `4px solid ${AU_GREEN}` }}
  >
    <div
      className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
      style={{ background: 'rgba(0,98,51,0.08)' }}
    >
      <span style={{ color: AU_GREEN }}>{icon}</span>
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      {loading
        ? <Loader2 size={16} className="animate-spin mt-1" style={{ color: AU_GREEN }} />
        : <p className="text-2xl font-bold text-gray-800">{value}</p>
      }
    </div>
  </div>
);

type ExportType   = 'all' | 'department' | 'status' | 'km';
type ExportPeriod = 'all' | 'weekly' | 'monthly' | 'yearly';

export const AdminDashboard = () => {
  const [users, setUsers]       = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Export modal state
  const [exportModal, setExportModal]   = useState(false);
  const [exportType, setExportType]     = useState<ExportType>('all');
  const [exportPeriod, setExportPeriod] = useState<ExportPeriod>('all');
  const [exportDept, setExportDept]     = useState('');
  const [exporting, setExporting]       = useState(false);

  useEffect(() => {
    Promise.all([getUsers(), getTransportRequests(), getVehicles()])
      .then(([u, r, v]) => {
        setUsers(Array.isArray(u) ? u : u.data ?? []);
        setRequests(Array.isArray(r) ? r : r.data ?? []);
        setVehicles(Array.isArray(v) ? v : v.data ?? []);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Chart data ──────────────────────────────────────────────────────────────
  const statusCounts = ['pending', 'approved', 'rejected', 'assigned', 'completed', 'cancelled']
    .map(s => ({
      name:  s.charAt(0).toUpperCase() + s.slice(1),
      value: requests.filter(r => r.status === s).length,
      color: STATUS_COLORS[s],
    }))
    .filter(s => s.value > 0);

  const deptMap: Record<string, number> = {};
  requests.forEach(r => {
    const d = r.department?.code ?? 'Unknown';
    deptMap[d] = (deptMap[d] ?? 0) + 1;
  });
  const deptData = Object.entries(deptMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const timeData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      day:      d.toLocaleDateString('en', { weekday: 'short' }),
      requests: requests.filter(r => r.created_at?.startsWith(d.toISOString().split('T')[0])).length,
    };
  });

  const vehicleData = [
    { name: 'Available',   value: vehicles.filter(v => v.status === 'available').length,   color: AU_GREEN },
    { name: 'In Use',      value: vehicles.filter(v => v.status === 'in_use').length,       color: AU_GOLD },
    { name: 'Maintenance', value: vehicles.filter(v => v.status === 'maintenance').length,  color: AU_GRAY },
  ].filter(v => v.value > 0);

  // ── Export helpers ───────────────────────────────────────────────────────────
  const filterByPeriod = (items: any[]) => {
    if (exportPeriod === 'all') return items;
    const now = new Date();
    return items.filter(r => {
      const d = new Date(r.created_at ?? r.required_date);
      if (exportPeriod === 'weekly') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      }
      if (exportPeriod === 'monthly')
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (exportPeriod === 'yearly')
        return d.getFullYear() === now.getFullYear();
      return true;
    });
  };

  const getFilteredRequests = () => {
    let filtered = filterByPeriod(requests);
    if (exportDept) filtered = filtered.filter(r => r.department?.code === exportDept);
    return filtered;
  };

  const toRow = (r: any) => ({
    'Request ID':            `#${r.id}`,
    'Requester':             r.requester ? `${r.requester.first_name} ${r.requester.last_name}` : '—',
    'Requester Email':       r.requester?.email ?? '—',
    'Phone / Extension':     r.telephone_extension ?? r.requester?.telephone_extension ?? '—',
    'Department':            r.department?.name ?? r.department?.code ?? '—',
    'Pickup Location':       r.pickup_location ?? '—',
    'Destination':           r.destination ?? '—',
    'Purpose':               r.purpose ?? '—',
    'Service Type':          r.service_type ?? '—',
    'Passengers':            r.passenger_count ?? '—',
    'Date':                  r.required_date ?? '—',
    'From Time':             r.required_from_time ?? '—',
    'To Time':               r.required_to_time ?? '—',
    'Working Hours':         r.working_hours ? 'Yes' : 'No',
    'Status':                r.status ?? '—',
    'Approved / Rejected By': r.reviewed_by
      ? `${r.reviewed_by.first_name} ${r.reviewed_by.last_name}` : '—',
    'Reviewed At':           r.reviewed_at ?? '—',
    'Rejection Reason':      r.rejection_reason ?? '—',
    'Dispatched By':         r.assigned_by
      ? `${r.assigned_by.first_name} ${r.assigned_by.last_name}` : '—',
    'Created At':            r.created_at ? new Date(r.created_at).toLocaleString() : '—',
  });

  const runExport = async () => {
    setExporting(true);
    try {
      const filtered = getFilteredRequests();
      const periodLabel = exportPeriod === 'all'
        ? 'AllTime'
        : exportPeriod.charAt(0).toUpperCase() + exportPeriod.slice(1);
      const deptLabel = exportDept ? `_${exportDept}` : '';
      const filename  = `AU_Transport_${exportType}_${periodLabel}${deptLabel}_${new Date().toISOString().split('T')[0]}.xlsx`;

      const wb = XLSX.utils.book_new();

      if (exportType === 'all') {
        // Single sheet — every request, all fields
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(filtered.map(toRow)),
          'All Requests',
        );
        // Summary sheet
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
          ['pending', 'approved', 'rejected', 'assigned', 'completed', 'cancelled'].map(s => ({
            'Status': s.charAt(0).toUpperCase() + s.slice(1),
            'Count':  filtered.filter(r => r.status === s).length,
          }))
        ), 'Status Summary');
      }

      if (exportType === 'department') {
        // One sheet per department that has requests
        const depts = [...new Set(filtered.map(r => r.department?.code ?? 'Unknown'))].sort();
        depts.forEach(dept => {
          const rows = filtered.filter(r => (r.department?.code ?? 'Unknown') === dept);
          XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.json_to_sheet(rows.map(toRow)),
            dept.slice(0, 31), // Excel tab name limit
          );
        });
        // Department summary
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
          depts.map(dept => ({
            'Department':     dept,
            'Total Requests': filtered.filter(r => (r.department?.code ?? 'Unknown') === dept).length,
            'Completed':      filtered.filter(r => (r.department?.code ?? 'Unknown') === dept && r.status === 'completed').length,
            'Pending':        filtered.filter(r => (r.department?.code ?? 'Unknown') === dept && r.status === 'pending').length,
            'Rejected':       filtered.filter(r => (r.department?.code ?? 'Unknown') === dept && r.status === 'rejected').length,
          }))
        ), 'Dept Summary');
      }

      if (exportType === 'status') {
        // Summary first
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
          ['pending', 'approved', 'rejected', 'assigned', 'completed', 'cancelled'].map(s => ({
            'Status': s.charAt(0).toUpperCase() + s.slice(1),
            'Count':  filtered.filter(r => r.status === s).length,
            'Period': periodLabel,
          }))
        ), 'Status Summary');
        // One sheet per status
        ['pending', 'approved', 'rejected', 'assigned', 'completed', 'cancelled'].forEach(s => {
          const rows = filtered.filter(r => r.status === s);
          if (rows.length === 0) return;
          XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.json_to_sheet(rows.map(toRow)),
            s.charAt(0).toUpperCase() + s.slice(1),
          );
        });
      }

      if (exportType === 'km') {
        const kmRows = filtered
          .filter(r => r.status === 'completed')
          .map(r => {
            // KM data lives in trip_status_updates if available
            const updates: any[] = r.trip_status_updates ?? [];
            const startUpdate = updates.find((u: any) => u.status === 'started');
            const endUpdate   = updates.find((u: any) => u.status === 'completed');
            const kmStart     = startUpdate?.km_reading ?? r.km_start ?? null;
            const kmEnd       = endUpdate?.km_reading   ?? r.km_end   ?? null;
            const kmTraveled  = endUpdate?.km_traveled  ?? (kmStart != null && kmEnd != null ? kmEnd - kmStart : null);
            return {
              'Request ID':    `#${r.id}`,
              'Requester':     r.requester ? `${r.requester.first_name} ${r.requester.last_name}` : '—',
              'Department':    r.department?.code ?? '—',
              'Destination':   r.destination ?? '—',
              'Date':          r.required_date ?? '—',
              'Dispatched By': r.assigned_by
                ? `${r.assigned_by.first_name} ${r.assigned_by.last_name}` : '—',
              'KM Start':      kmStart ?? '—',
              'KM End':        kmEnd   ?? '—',
              'KM Traveled':   kmTraveled ?? '—',
            };
          });

        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(kmRows),
          'KM Summary',
        );

        // Total per vehicle if vehicle data is present
        const vehicleKm: Record<string, number> = {};
        filtered
          .filter(r => r.status === 'completed')
          .forEach(r => {
            const updates: any[] = r.trip_status_updates ?? [];
            const endUpdate = updates.find((u: any) => u.status === 'completed');
            const km = endUpdate?.km_traveled ?? 0;
            const plate = r.vehicle?.plate_number ?? 'Unknown';
            vehicleKm[plate] = (vehicleKm[plate] ?? 0) + km;
          });
        if (Object.keys(vehicleKm).length > 0) {
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
            Object.entries(vehicleKm).map(([plate, km]) => ({
              'Vehicle Plate': plate,
              'Total KM':      km,
            }))
          ), 'KM by Vehicle');
        }
      }

      XLSX.writeFile(wb, filename);
      setExportModal(false);
    } finally {
      setExporting(false);
    }
  };

  // ── Unique departments for dropdown ─────────────────────────────────────────
  const uniqueDepts = [...new Set(requests.map(r => r.department?.code).filter(Boolean))].sort();

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-sm text-gray-500 mt-0.5">AU Transport System — Overview</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-lg border" style={{ borderColor: '#e5ede8' }}>
              {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <button
              onClick={() => setExportModal(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90"
              style={{ background: AU_GREEN }}
            >
              <Download size={15} /> Export Excel
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Users"    value={users.length}                             icon={<Users size={20} />}     loading={loading} />
          <StatCard label="Active Users"   value={users.filter(u => u.active !== false).length} icon={<UserCheck size={20} />} loading={loading} />
          <StatCard label="Inactive Users" value={users.filter(u => u.active === false).length} icon={<UserCheck size={20} />} loading={loading} />
          <StatCard label="Total Requests" value={requests.length}                           icon={<FileText size={20} />}  loading={loading} />
          <StatCard label="Fleet Size"     value={vehicles.length}                           icon={<Car size={20} />}       loading={loading} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Status Donut */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: '#e5ede8' }}>
            <h3 className="font-semibold text-gray-700 mb-4 text-sm flex items-center gap-2">
              <FileText size={14} style={{ color: AU_GREEN }} /> Requests by Status
            </h3>
            {loading
              ? <div className="flex items-center justify-center h-44"><Loader2 size={22} className="animate-spin" style={{ color: AU_GREEN }} /></div>
              : statusCounts.length === 0
                ? <div className="flex items-center justify-center h-44 text-gray-300 text-sm">No data yet</div>
                : (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="55%" height={150}>
                      <PieChart>
                        <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value">
                          {statusCounts.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {statusCounts.map(s => (
                        <div key={s.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                            <span className="text-gray-600">{s.name}</span>
                          </div>
                          <span className="font-bold text-gray-700">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            }
          </div>

          {/* Vehicle Donut */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: '#e5ede8' }}>
            <h3 className="font-semibold text-gray-700 mb-4 text-sm flex items-center gap-2">
              <Car size={14} style={{ color: AU_GREEN }} /> Vehicle Utilization
            </h3>
            {loading
              ? <div className="flex items-center justify-center h-44"><Loader2 size={22} className="animate-spin" style={{ color: AU_GREEN }} /></div>
              : vehicleData.length === 0
                ? <div className="flex items-center justify-center h-44 text-gray-300 text-sm">No vehicles</div>
                : (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="55%" height={150}>
                      <PieChart>
                        <Pie data={vehicleData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value">
                          {vehicleData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {vehicleData.map(v => (
                        <div key={v.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: v.color }} />
                            <span className="text-gray-600">{v.name}</span>
                          </div>
                          <span className="font-bold text-gray-700">{v.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            }
          </div>

          {/* Request Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border space-y-2.5" style={{ borderColor: '#e5ede8' }}>
            <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2 mb-3">
              <TrendingUp size={14} style={{ color: AU_GREEN }} /> Request Summary
            </h3>
            {[
              { label: 'Pending',   value: requests.filter(r => r.status === 'pending').length,   icon: <Clock size={12} />,       color: AU_GOLD },
              { label: 'Approved',  value: requests.filter(r => r.status === 'approved').length,  icon: <CheckCircle size={12} />, color: AU_GREEN_MID },
              { label: 'Rejected',  value: requests.filter(r => r.status === 'rejected').length,  icon: <XCircle size={12} />,     color: AU_RED },
              { label: 'Assigned',  value: requests.filter(r => r.status === 'assigned').length,  icon: <Car size={12} />,         color: AU_GREEN_LITE },
              { label: 'Completed', value: requests.filter(r => r.status === 'completed').length, icon: <CheckCircle size={12} />, color: AU_GREEN_DARK },
            ].map(stat => (
              <div key={stat.label} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: `${stat.color}12` }}>
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
          <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: '#e5ede8' }}>
            <h3 className="font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2">
              <TrendingUp size={14} style={{ color: AU_GREEN }} /> Requests — Last 7 Days
            </h3>
            {loading
              ? <div className="flex items-center justify-center h-44"><Loader2 size={22} className="animate-spin" style={{ color: AU_GREEN }} /></div>
              : (
                <ResponsiveContainer width="100%" height={170}>
                  <LineChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5ede8', fontSize: 12 }} />
                    <Line type="monotone" dataKey="requests" stroke={AU_GREEN} strokeWidth={2.5}
                      dot={{ fill: AU_GREEN, r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: AU_GOLD, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )
            }
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: '#e5ede8' }}>
            <h3 className="font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2">
              <Users size={14} style={{ color: AU_GREEN }} /> Requests by Department
            </h3>
            {loading
              ? <div className="flex items-center justify-center h-44"><Loader2 size={22} className="animate-spin" style={{ color: AU_GREEN }} /></div>
              : deptData.length === 0
                ? <div className="flex items-center justify-center h-44 text-gray-300 text-sm">No data yet</div>
                : (
                  <ResponsiveContainer width="100%" height={170}>
                    <BarChart data={deptData} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5ede8', fontSize: 12 }} />
                      <Bar dataKey="count" name="Requests" radius={[4, 4, 0, 0]}>
                        {deptData.map((_, i) => <Cell key={i} fill={DEPT_SHADES[i % DEPT_SHADES.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )
            }
          </div>
        </div>

        {/* Recent Requests Table */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#e5ede8' }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#e5ede8' }}>
            <h3 className="font-semibold text-gray-700 text-sm">Recent Transport Requests</h3>
            <span className="text-xs text-gray-400">{requests.length} total</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={26} className="animate-spin" style={{ color: AU_GREEN }} />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No transport requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: '#f7faf8' }}>
                  <tr>
                    {['ID', 'Requester', 'Destination', 'Department', 'Date', 'Status'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.slice(0, 8).map((req: any) => (
                    <tr key={req.id} className="border-t hover:bg-green-50/20 transition-colors" style={{ borderColor: '#f0f4f0' }}>
                      <td className="px-6 py-3.5 text-xs font-mono" style={{ color: '#9ca3af' }}>#{req.id}</td>
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
                            background: `${STATUS_COLORS[req.status] ?? '#9ca3af'}15`,
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

      {/* ── Export Modal ──────────────────────────────────────────────────────── */}
      {exportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">

            {/* Modal header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Export Report</h3>
                <p className="text-xs text-gray-400 mt-0.5">Choose what to export and the time range</p>
              </div>
              <button
                onClick={() => setExportModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Report type */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Report Type</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'all',        label: '📋 All Requests',    desc: 'Every request, all fields' },
                  { value: 'department', label: '🏢 By Department',   desc: 'One sheet per department' },
                  { value: 'status',     label: '📊 By Status',       desc: 'One sheet per status' },
                  { value: 'km',         label: '🚗 KM / Fleet',      desc: 'Odometer & distance data' },
                ] as { value: ExportType; label: string; desc: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setExportType(opt.value)}
                    className="py-3 px-3 rounded-xl text-left border-2 transition-all"
                    style={{
                      borderColor: exportType === opt.value ? AU_GREEN : '#e5e7eb',
                      background:  exportType === opt.value ? `${AU_GREEN}10` : 'white',
                    }}
                  >
                    <p className="text-sm font-semibold" style={{ color: exportType === opt.value ? AU_GREEN : '#374151' }}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Period */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Period</p>
              <div className="grid grid-cols-4 gap-2">
                {([
                  { value: 'all',     label: 'All Time' },
                  { value: 'weekly',  label: 'This Week' },
                  { value: 'monthly', label: 'This Month' },
                  { value: 'yearly',  label: 'This Year' },
                ] as { value: ExportPeriod; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setExportPeriod(opt.value)}
                    className="py-2 px-1 rounded-xl text-xs font-medium border-2 transition-all text-center"
                    style={{
                      borderColor: exportPeriod === opt.value ? AU_GREEN : '#e5e7eb',
                      background:  exportPeriod === opt.value ? `${AU_GREEN}10` : 'white',
                      color:       exportPeriod === opt.value ? AU_GREEN : '#374151',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Department filter */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Department <span className="font-normal text-gray-400">(optional)</span>
              </p>
              <select
                value={exportDept}
                onChange={e => setExportDept(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': AU_GREEN } as any}
              >
                <option value="">All Departments</option>
                {uniqueDepts.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

            {/* Preview count */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm"
              style={{ background: `${AU_GREEN}08`, border: `1px solid ${AU_GREEN}20` }}
            >
              <span style={{ color: AU_GREEN }}>
                {(() => {
                  const count = getFilteredRequests().length;
                  return `${count} request${count !== 1 ? 's' : ''} will be exported`;
                })()}
              </span>
              <span className="text-xs text-gray-400 capitalize">
                {exportPeriod === 'all' ? 'All time' : exportPeriod}
                {exportDept ? ` · ${exportDept}` : ''}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setExportModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={runExport}
                disabled={exporting || getFilteredRequests().length === 0}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
                style={{ background: AU_GREEN }}
              >
                {exporting
                  ? <><Loader2 size={15} className="animate-spin" /> Generating...</>
                  : <><Download size={15} /> Download Excel</>
                }
              </button>
            </div>

          </div>
        </div>
      )}

    </AdminLayout>
  );
};