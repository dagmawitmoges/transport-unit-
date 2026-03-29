import { useEffect, useState } from 'react';
import { AdminLayout } from '../../layout/adminLayout';
import { getTransportRequests } from '../../api/admin';
import { Loader2, Search } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  assigned:  'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-50 text-red-400',
};

const STATUS_OPTIONS = ['all', 'pending', 'approved', 'rejected', 'assigned', 'completed', 'cancelled'];

export const AdminRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState('all');
  const [date, setDate]         = useState('');
  const [search, setSearch]     = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getTransportRequests({
        status: status !== 'all' ? status : undefined,
        date:   date || undefined,
      });
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [status, date]);

  const filtered = requests.filter((r) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      r.destination?.toLowerCase().includes(term) ||
      r.purpose?.toLowerCase().includes(term) ||
      r.requester?.first_name?.toLowerCase().includes(term) ||
      r.requester?.last_name?.toLowerCase().includes(term)
    );
  });

  // format time from full ISO to HH:MM
  const formatTime = (iso: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Transport Requests</h2>
          <p className="text-sm text-gray-500 mt-1">View and manage all transport requests</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search destination, purpose, requester..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-72"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 capitalize"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Clear filters */}
          {(status !== 'all' || date || search) && (
            <button
              onClick={() => { setStatus('all'); setDate(''); setSearch(''); }}
              className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              No transport requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">ID</th>
                    <th className="px-6 py-3 text-left font-medium">Requester</th>
                    <th className="px-6 py-3 text-left font-medium">Destination</th>
                    <th className="px-6 py-3 text-left font-medium">Purpose</th>
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                    <th className="px-6 py-3 text-left font-medium">Time</th>
                    <th className="px-6 py-3 text-left font-medium">Service</th>
                    <th className="px-6 py-3 text-left font-medium">Dept</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">#{req.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {req.requester
                          ? `${req.requester.first_name} ${req.requester.last_name}`
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{req.destination ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{req.purpose ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500">{req.required_date ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {formatTime(req.required_from_time)} – {formatTime(req.required_to_time)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 capitalize">{req.service_type ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500">{req.department?.code ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[req.status] ?? 'bg-gray-100 text-gray-500'}`}>
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