import { useEffect, useState } from 'react';
import { StaffLayout } from '../../layout/stafflayouts';
import { getDriverTrips, updateTripStatus, getTripStatusUpdates } from '../../api/driver';
import { Button } from '../../components/button';
import { Loader2, MapPin, X, ChevronRight } from 'lucide-react';

const statusColors: Record<string, string> = {
  assigned:    'bg-blue-100 text-blue-700',
  started:     'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-orange-100 text-orange-700',
  en_route:    'bg-orange-100 text-orange-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-50 text-red-400',
};

const nextStatus: Record<string, { value: string; label: string; color: string } | null> = {
  assigned:    { value: 'started',   label: 'Start Trip',    color: 'bg-yellow-500 hover:bg-yellow-600' },
  started:     { value: 'en_route',  label: 'Mark En Route', color: 'bg-orange-500 hover:bg-orange-600' },
  in_progress: { value: 'completed', label: 'Complete Trip',  color: 'bg-green-600 hover:bg-green-700' }, // ← changed
  en_route:    { value: 'completed', label: 'Complete Trip',  color: 'bg-green-600 hover:bg-green-700' },
  completed:   null,
};

const formatTime = (iso: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const DriverTrips = () => {
  const [trips, setTrips]               = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [updateModal, setUpdateModal]   = useState<any | null>(null);
  const [logsModal, setLogsModal]       = useState<any | null>(null);
  const [logs, setLogs]                 = useState<any[]>([]);
  const [logsLoading, setLogsLoading]   = useState(false);
  const [note, setNote]                 = useState('');
  const [locationNote, setLocationNote] = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [apiError, setApiError]         = useState('');

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await getDriverTrips();
      setTrips(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const openUpdateModal = (trip: any) => {
    setUpdateModal(trip);
    setNote('');
    setLocationNote('');
    setApiError('');
  };

  const openLogsModal = async (trip: any) => {
    setLogsModal(trip);
    setLogsLoading(true);
    try {
      const data = await getTripStatusUpdates(trip.id);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!updateModal) return;
    const next = nextStatus[updateModal.status];
    if (!next) return;
    setSubmitting(true);
    setApiError('');
    try {
      await updateTripStatus(updateModal.id, {
        status: next.value,
        note: note || undefined,
        location_note: locationNote || undefined,
      });
      setUpdateModal(null);
      fetchTrips();
    } catch (err: any) {
      setApiError(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeTrips    = trips.filter((t) => ['assigned', 'started', 'in_progress', 'en_route'].includes(t.status));
  const completedTrips = trips.filter((t) => t.status === 'completed');

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Trips</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and update your assigned trips</p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-white rounded-xl px-5 py-3 border border-gray-100 shadow-sm text-sm">
            <span className="text-gray-500">Active trips: </span>
            <span className="font-bold text-blue-600">{activeTrips.length}</span>
          </div>
          <div className="bg-white rounded-xl px-5 py-3 border border-gray-100 shadow-sm text-sm">
            <span className="text-gray-500">Completed: </span>
            <span className="font-bold text-green-600">{completedTrips.length}</span>
          </div>
        </div>

        {/* Active Trips */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700">Active Trips</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : activeTrips.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No active trips.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">ID</th>
                    <th className="px-6 py-3 text-left font-medium">Destination</th>
                    <th className="px-6 py-3 text-left font-medium">Requester</th>
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                    <th className="px-6 py-3 text-left font-medium">Time</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeTrips.map((trip) => {
                    const next = nextStatus[trip.status];
                    return (
                      <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-500">#{trip.id}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{trip.destination}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {trip.requester ? `${trip.requester.first_name} ${trip.requester.last_name}` : '—'}
                        </td>
                        <td className="px-6 py-4 text-gray-500">{trip.required_date}</td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {formatTime(trip.required_from_time)} – {formatTime(trip.required_to_time)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[trip.status] ?? 'bg-gray-100 text-gray-500'}`}>
                            {trip.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {next && (
                              <button
                                onClick={() => openUpdateModal(trip)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors ${next.color}`}
                              >
                                <ChevronRight size={12} />
                                {next.label}
                              </button>
                            )}
                            <button
                              onClick={() => openLogsModal(trip)}
                              className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                            >
                              View logs
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Completed Trips */}
        {completedTrips.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-700">Completed Trips</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">ID</th>
                    <th className="px-6 py-3 text-left font-medium">Destination</th>
                    <th className="px-6 py-3 text-left font-medium">Requester</th>
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Logs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {completedTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">#{trip.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{trip.destination}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {trip.requester ? `${trip.requester.first_name} ${trip.requester.last_name}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{trip.required_date}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openLogsModal(trip)}
                          className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                        >
                          View logs
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {updateModal && nextStatus[updateModal.status] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Update Trip Status</h3>
                <p className="text-sm text-gray-500">{updateModal.destination} · {updateModal.required_date}</p>
              </div>
              <button onClick={() => setUpdateModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[updateModal.status] ?? 'bg-gray-100 text-gray-500'}`}>
                {updateModal.status?.replace(/_/g, ' ')}
              </span>
              <ChevronRight size={16} className="text-gray-400" />
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[nextStatus[updateModal.status]!.value] ?? 'bg-gray-100 text-gray-500'}`}>
                {nextStatus[updateModal.status]!.value.replace(/_/g, ' ')}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any notes about this update..."
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><MapPin size={14} /> Location Note (optional)</span>
              </label>
              <input
                type="text"
                value={locationNote}
                onChange={(e) => setLocationNote(e.target.value)}
                placeholder="e.g. Bole Road, near AU HQ"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>

            {apiError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{apiError}</div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setUpdateModal(null)}>Cancel</Button>
              <Button fullWidth disabled={submitting} onClick={handleUpdate}>
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Updating...
                  </span>
                ) : nextStatus[updateModal.status]!.label}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Trip Logs Modal */}
      {logsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Trip Logs</h3>
                <p className="text-sm text-gray-500">{logsModal.destination} · #{logsModal.id}</p>
              </div>
              <button onClick={() => setLogsModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-blue-500" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No status updates yet.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[log.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {log.status?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(log.reported_at).toLocaleString()}
                        </span>
                      </div>
                      {log.note && <p className="text-sm text-gray-600 mt-1">{log.note}</p>}
                      {log.location_note && (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <MapPin size={11} /> {log.location_note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button variant="secondary" fullWidth onClick={() => setLogsModal(null)}>Close</Button>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};