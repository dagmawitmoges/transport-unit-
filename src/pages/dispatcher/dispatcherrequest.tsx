import { useEffect, useState } from 'react';
import { StaffLayout } from '../../layout/stafflayouts';
import { getTransportRequests } from '../../api/admin';
import { getAvailableDrivers, getAvailableVehicles, assignRequest } from '../../api/dispatcher';
import { Button } from '../../components/button';
import { Loader2, Truck, X, Eye } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  assigned:  'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-50 text-red-400',
};

const formatTime = (iso: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const DetailRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
  </div>
);

export const DispatcherRequests = () => {
  const [requests, setRequests]       = useState<any[]>([]);
  const [drivers, setDrivers]         = useState<any[]>([]);
  const [vehicles, setVehicles]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [assignModal, setAssignModal] = useState<any | null>(null);
  const [detailModal, setDetailModal] = useState<any | null>(null);
  const [driverId, setDriverId]       = useState('');
  const [vehicleId, setVehicleId]     = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [notes, setNotes]             = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [apiError, setApiError]       = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqs, drvs, vehs] = await Promise.all([
        getTransportRequests({ status: 'approved' }),
        getAvailableDrivers(),
        getAvailableVehicles(),
      ]);
      setRequests(reqs);
      setDrivers(drvs);
      setVehicles(vehs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAssign = (req: any) => {
    setAssignModal(req);
    setDriverId('');
    setVehicleId('');
    setDriverPhone('');
    setNotes('');
    setApiError('');
  };

  // Auto-fill driver phone when driver is selected
  const handleDriverChange = (id: string) => {
    setDriverId(id);
    const selected = drivers.find((d) => String(d.id) === String(id));
    setDriverPhone(selected?.phone_number ?? '');
  };

  const handleAssign = async () => {
    if (!assignModal || !driverId || !vehicleId) return;
    setSubmitting(true);
    setApiError('');
    try {
      await assignRequest(assignModal.id, {
        driver_id:  driverId,
        vehicle_id: vehicleId,
        notes,
      });
      setAssignModal(null);
      fetchData();
    } catch (err: any) {
      setApiError(err.response?.data?.error || 'Failed to assign request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dispatch</h2>
          <p className="text-sm text-gray-500 mt-1">Assign drivers and vehicles to approved requests</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-white rounded-xl px-5 py-3 border border-gray-100 shadow-sm text-sm">
            <span className="text-gray-500">Approved requests: </span>
            <span className="font-bold text-gray-800">{requests.length}</span>
          </div>
          <div className="bg-white rounded-xl px-5 py-3 border border-gray-100 shadow-sm text-sm">
            <span className="text-gray-500">Available drivers: </span>
            <span className="font-bold text-green-600">{drivers.length}</span>
          </div>
          <div className="bg-white rounded-xl px-5 py-3 border border-gray-100 shadow-sm text-sm">
            <span className="text-gray-500">Available vehicles: </span>
            <span className="font-bold text-blue-600">{vehicles.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              No approved requests pending assignment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">ID</th>
                    <th className="px-6 py-3 text-left font-medium">Requester</th>
                    <th className="px-6 py-3 text-left font-medium">Destination</th>
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                    <th className="px-6 py-3 text-left font-medium">Time</th>
                    <th className="px-6 py-3 text-left font-medium">Service</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">#{req.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {req.requester ? `${req.requester.first_name} ${req.requester.last_name}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-800">{req.destination}</td>
                      <td className="px-6 py-4 text-gray-500">{req.required_date}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {formatTime(req.required_from_time)} – {formatTime(req.required_to_time)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 capitalize">{req.service_type}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[req.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setDetailModal(req)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
                          >
                            <Eye size={13} /> View
                          </button>
                          <button
                            onClick={() => openAssign(req)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            <Truck size={13} /> Assign
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
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

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <DetailRow label="Pickup Location" value={detailModal.pickup_location} />
              <DetailRow label="Destination" value={detailModal.destination} />
              <DetailRow label="Date" value={detailModal.required_date} />
              <DetailRow label="Time" value={`${formatTime(detailModal.required_from_time)} – ${formatTime(detailModal.required_to_time)}`} />
              <DetailRow label="Working Hours" value={detailModal.working_hours ? 'Yes' : 'No'} />
              <DetailRow label="Service Type" value={detailModal.service_type} />
              {detailModal.passenger_count && (
                <DetailRow label="No. of People" value={detailModal.passenger_count} />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <DetailRow label="Requested By" value={
                detailModal.requester
                  ? `${detailModal.requester.first_name} ${detailModal.requester.last_name}`
                  : '—'
              } />
              <DetailRow label="Department" value={detailModal.department?.name ?? detailModal.department?.code} />
              <DetailRow label="Phone" value={detailModal.telephone_extension} />
              <DetailRow label="Purpose" value={detailModal.purpose} />
            </div>

            {/* Approved by — important for dispatcher */}
            {detailModal.reviewed_by && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-green-700 uppercase">Approved By</p>
                <DetailRow
                  label="Name"
                  value={`${detailModal.reviewed_by.first_name} ${detailModal.reviewed_by.last_name}`}
                />
                <DetailRow label="Approved At" value={
                  detailModal.reviewed_at
                    ? new Date(detailModal.reviewed_at).toLocaleString()
                    : '—'
                } />
              </div>
            )}

            <div className="flex gap-3">
              <Button fullWidth onClick={() => { setDetailModal(null); openAssign(detailModal); }}>
                Assign Now
              </Button>
              <Button variant="secondary" fullWidth onClick={() => setDetailModal(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign Modal ── */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Assign Request #{assignModal.id}</h3>
                <p className="text-sm text-gray-500">{assignModal.destination} · {assignModal.required_date}</p>
              </div>
              <button onClick={() => setAssignModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Driver */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Driver <span className="text-red-500">*</span>
              </label>
              <select
                value={driverId}
                onChange={(e) => handleDriverChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              >
                <option value="">Select a driver</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.full_name} — {d.license_number}</option>
                ))}
              </select>
              {drivers.length === 0 && <p className="mt-1 text-xs text-red-500">No available drivers.</p>}
            </div>

            {/* Driver Phone — auto filled, editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Driver Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="Auto-filled from driver profile"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
              <p className="mt-1 text-xs text-gray-400">Auto-filled from driver profile. Edit if needed.</p>
            </div>

            {/* Vehicle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Vehicle <span className="text-red-500">*</span>
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              >
                <option value="">Select a vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.make} {v.model} ({v.plate_number}) · {v.capacity} seats</option>
                ))}
              </select>
              {vehicles.length === 0 && <p className="mt-1 text-xs text-red-500">No available vehicles.</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional instructions..."
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
              />
            </div>

            {apiError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{apiError}</div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setAssignModal(null)}>Cancel</Button>
              <Button fullWidth disabled={submitting || !driverId || !vehicleId} onClick={handleAssign}>
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Assigning...
                  </span>
                ) : 'Assign'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};