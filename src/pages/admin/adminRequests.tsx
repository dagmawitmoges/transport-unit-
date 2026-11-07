import { useEffect, useState } from 'react';
import { AdminLayout } from '../../layout/adminLayout';
import { getTransportRequests, getRequestDetail } from '../../api/admin';
import { Loader2, Search, X, Gauge } from 'lucide-react';
import { formatTime } from '../../utils/time';

const statusColors: Record<string, string> = {
  pending:     'bg-yellow-100 text-yellow-700',
  approved:    'bg-green-100 text-green-700',
  rejected:    'bg-red-100 text-red-700',
  assigned:    'bg-blue-100 text-blue-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed:   'bg-gray-100 text-gray-600',
  cancelled:   'bg-red-50 text-red-400',
};

const tripStatusColors: Record<string, string> = {
  started:     'bg-yellow-100 text-yellow-700',
  en_route:    'bg-orange-100 text-orange-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-50 text-red-400',
};

const STATUS_OPTIONS = ['all', 'pending', 'approved', 'rejected', 'assigned', 'in_progress', 'completed', 'cancelled'];

const DetailRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
);

export const AdminRequests = () => {
  const [requests, setRequests]         = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [status, setStatus]             = useState('all');
  const [date, setDate]                 = useState('');
  const [search, setSearch]             = useState('');
  const [detailModal, setDetailModal]   = useState<any | null>(null);
  const [detailData, setDetailData]     = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  useEffect(() => { fetchRequests(); }, [status, date]);

  const openDetail = async (req: any) => {
    setDetailModal(req);
    setDetailData(null);
    setDetailLoading(true);
    try {
      const data = await getRequestDetail(req.id);
      setDetailData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

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

  // Calculate total KM traveled from trip updates
  const getTotalKm = (updates: any[]) => {
    const completionUpdate = updates?.find((u: any) => u.km_traveled != null);
    return completionUpdate?.km_traveled ?? null;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Transport Requests</h2>
          <p className="text-sm text-gray-500 mt-1">View and manage all transport requests</p>
        </div>

        <div className="flex flex-wrap gap-3">
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
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Statuses' : s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {(status !== 'all' || date || search) && (
            <button
              onClick={() => { setStatus('all'); setDate(''); setSearch(''); }}
              className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">No transport requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">ID</th>
                    <th className="px-6 py-3 text-left font-medium">Requester</th>
                    <th className="px-6 py-3 text-left font-medium">Destination</th>
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                    <th className="px-6 py-3 text-left font-medium">Service</th>
                    <th className="px-6 py-3 text-left font-medium">Dept</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">#{req.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {req.requester ? `${req.requester.first_name} ${req.requester.last_name}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-800">{req.destination ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500">{req.required_date ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500 capitalize">{req.service_type ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500">{req.department?.code ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[req.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {req.status?.replace(/_/g, ' ') ?? 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openDetail(req)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Full Detail Modal ── */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Request Detail</h3>
                <p className="text-sm text-gray-500">#{detailModal.id} · {detailModal.required_date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[detailModal.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {detailModal.status?.replace(/_/g, ' ')}
                </span>
                <button onClick={() => setDetailModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-blue-500" />
              </div>
            ) : detailData ? (
              <div className="space-y-4">

                {/* Request Info */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                  <SectionTitle title="Request Info" />
                  <div className="grid grid-cols-2 gap-3">
                    <DetailRow label="Requested By" value={
                      detailData.requester
                        ? `${detailData.requester.first_name} ${detailData.requester.last_name}`
                        : '—'
                    } />
                    <DetailRow label="Department" value={detailData.department?.name ?? detailData.department?.code} />
                    <DetailRow label="Phone" value={detailData.telephone_extension} />
                    <DetailRow label="Purpose" value={detailData.purpose} />
                    <DetailRow label="Pickup Location" value={detailData.pickup_location} />
                    <DetailRow label="Destination" value={detailData.destination} />
                    <DetailRow label="Date" value={detailData.required_date} />
                    <DetailRow label="Time" value={`${formatTime(detailData.required_from_time)} – ${formatTime(detailData.required_to_time)}`} />
                    <DetailRow label="Service Type" value={detailData.service_type} />
                    {detailData.passenger_count && (
                      <DetailRow label="No. of People" value={detailData.passenger_count} />
                    )}
                    <DetailRow label="Working Hours" value={detailData.working_hours ? 'Yes' : 'No'} />
                  </div>
                </div>

                {/* Approval Info */}
                {detailData.reviewed_by && (
                  <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <SectionTitle title="Approval Info" />
                    <div className="grid grid-cols-2 gap-3">
                      <DetailRow
                        label="Approved / Rejected By"
                        value={`${detailData.reviewed_by.first_name} ${detailData.reviewed_by.last_name}`}
                      />
                      <DetailRow label="Reviewed At" value={
                        detailData.reviewed_at
                          ? new Date(detailData.reviewed_at).toLocaleString()
                          : '—'
                      } />
                    </div>
                    {detailData.rejection_reason && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-500 font-medium">Rejection Reason</p>
                        <p className="text-sm text-red-700 mt-0.5">{detailData.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Assignment Info */}
                {detailData.assignment && (
                  <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <SectionTitle title="Assignment Info" />
                    <div className="grid grid-cols-2 gap-3">
                      {detailData.driver && (
                        <>
                          <DetailRow label="Driver" value={`${detailData.driver.full_name ?? '—'}`} />
                          <DetailRow label="Driver Phone" value={detailData.driver.phone_number} />
                          <DetailRow label="License Number" value={detailData.driver.license_number} />
                        </>
                      )}
                      {detailData.vehicle && (
                        <>
                          <DetailRow label="Vehicle" value={`${detailData.vehicle.make} ${detailData.vehicle.model}`} />
                          <DetailRow label="Plate Number" value={detailData.vehicle.plate_number} />
                          <DetailRow label="Capacity" value={`${detailData.vehicle.capacity} seats`} />
                        </>
                      )}
                      {detailData.assigned_by && (
                        <DetailRow
                          label="Dispatched By"
                          value={`${detailData.assigned_by.first_name} ${detailData.assigned_by.last_name}`}
                        />
                      )}
                      {detailData.assignment.notes && (
                        <DetailRow label="Dispatch Notes" value={detailData.assignment.notes} />
                      )}
                    </div>
                  </div>
                )}

                {/* Trip Status Updates — KM Data */}
                {detailData.trip_status_updates?.length > 0 && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <SectionTitle title="Trip Updates & KM Data" />
                      {getTotalKm(detailData.trip_status_updates) != null && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 rounded-lg">
                          <Gauge size={14} className="text-green-700" />
                          <span className="text-xs font-bold text-green-700">
                            Total: {getTotalKm(detailData.trip_status_updates).toLocaleString()} km
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {detailData.trip_status_updates.map((update: any) => (
                        <div key={update.id} className="p-3 bg-white border border-gray-100 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${tripStatusColors[update.status] ?? 'bg-gray-100 text-gray-500'}`}>
                              {update.status?.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-400">
                              {update.reported_at ? new Date(update.reported_at).toLocaleString() : '—'}
                            </span>
                          </div>

                          {/* KM Reading */}
                          {update.km_reading != null && (
                            <div className="flex items-center gap-4 p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-1.5 text-xs">
                                <Gauge size={13} className="text-gray-400" />
                                <span className="text-gray-500">Odometer:</span>
                                <span className="font-semibold text-gray-800">{update.km_reading.toLocaleString()} km</span>
                              </div>
                              {update.km_traveled != null && (
                                <div className="flex items-center gap-1.5 text-xs ml-auto">
                                  <span className="text-gray-500">KM Traveled:</span>
                                  <span className="font-bold text-green-600">{update.km_traveled.toLocaleString()} km</span>
                                </div>
                              )}
                            </div>
                          )}

                          {update.note && (
                            <p className="text-xs text-gray-600">{update.note}</p>
                          )}
                          {update.location_note && (
                            <p className="text-xs text-gray-400">📍 {update.location_note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : null}

            <button
              onClick={() => setDetailModal(null)}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};