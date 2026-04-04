import { useEffect, useState } from 'react';
import { StaffLayout } from '../../layout/stafflayouts';
import { getDriverTrips, updateTripStatus, getTripStatusUpdates } from '../../api/driver';
import { Button } from '../../components/button';
import { Loader2, MapPin, X, ChevronRight, Gauge, CheckCircle2, Car } from 'lucide-react';

const statusColors: Record<string, string> = {
  assigned:    'bg-blue-100 text-blue-700',
  started:     'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-orange-100 text-orange-700',
  en_route:    'bg-orange-100 text-orange-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-50 text-red-400',
};

const nextStatus: Record<string, { value: string; label: string; color: string; requiresKm: boolean } | null> = {
  assigned:    { value: 'started',   label: 'Start Trip',    color: 'bg-yellow-500 hover:bg-yellow-600', requiresKm: true  },
  started:     { value: 'en_route',  label: 'Mark En Route', color: 'bg-orange-500 hover:bg-orange-600', requiresKm: false },
  in_progress: { value: 'completed', label: 'Complete Trip',  color: 'bg-green-600 hover:bg-green-700',  requiresKm: true  },
  en_route:    { value: 'completed', label: 'Complete Trip',  color: 'bg-green-600 hover:bg-green-700',  requiresKm: true  },
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
  const [kmReading, setKmReading]       = useState('');
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
    setKmReading('');
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

    if (next.requiresKm && !kmReading) {
      setApiError('Please enter the current odometer reading (KM).');
      return;
    }
    if (next.requiresKm && isNaN(Number(kmReading))) {
      setApiError('KM reading must be a valid number.');
      return;
    }

    setSubmitting(true);
    setApiError('');
    try {
      await updateTripStatus(updateModal.id, {
        status:        next.value,
        note:          note || undefined,
        location_note: locationNote || undefined,
        km_reading:    next.requiresKm ? Number(kmReading) : undefined,
      });
      setUpdateModal(null);
      fetchTrips();
    } catch (err: any) {
      setApiError(err.response?.data?.errors?.[0] || err.response?.data?.error || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeTrips    = trips.filter((t) => ['assigned', 'started', 'in_progress', 'en_route'].includes(t.status));
  const completedTrips = trips.filter((t) => t.status === 'completed');

  return (
    <StaffLayout>
      <div className="max-w-2xl mx-auto space-y-5 px-2 pb-10">

        {/* Header */}
        <div className="pt-2">
          <h2 className="text-2xl font-bold text-gray-800">My Trips</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and update your assigned trips</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Active trips</p>
            <p className="text-2xl font-bold text-blue-600">{activeTrips.length}</p>
          </div>
          <div className="bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completedTrips.length}</p>
          </div>
        </div>

        {/* Active Trips */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Active Trips</h3>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : activeTrips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 text-gray-400 text-sm">
              No active trips assigned.
            </div>
          ) : (
            <div className="space-y-3">
              {activeTrips.map((trip) => {
                const next = nextStatus[trip.status];
                return (
                  <div key={trip.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Car size={15} className="text-gray-400 shrink-0" />
                          <p className="font-semibold text-gray-800 truncate">{trip.destination}</p>
                        </div>
                        <p className="text-xs text-gray-400">
                          #{trip.id} · {trip.required_date} · {formatTime(trip.required_from_time)} – {formatTime(trip.required_to_time)}
                        </p>
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[trip.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {trip.status?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-400">Requester</p>
                        <p className="font-medium text-gray-700">
                          {trip.requester ? `${trip.requester.first_name} ${trip.requester.last_name}` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Purpose</p>
                        <p className="font-medium text-gray-700 truncate">{trip.purpose || '—'}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      {next && (
                        <button
                          onClick={() => openUpdateModal(trip)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-colors ${next.color}`}
                        >
                          <ChevronRight size={16} />
                          {next.label}
                        </button>
                      )}
                      <button
                        onClick={() => openLogsModal(trip)}
                        className="px-4 py-3 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        Logs
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Trips */}
        {completedTrips.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Completed Trips</h3>
            <div className="space-y-3">
              {completedTrips.map((trip) => (
                <div key={trip.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                        <p className="font-semibold text-gray-800 truncate">{trip.destination}</p>
                      </div>
                      <p className="text-xs text-gray-400">#{trip.id} · {trip.required_date}</p>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Completed
                    </span>
                  </div>
                  <button
                    onClick={() => openLogsModal(trip)}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    View Trip Logs & KM
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Update Status Modal ── */}
      {updateModal && nextStatus[updateModal.status] && (() => {
        const next = nextStatus[updateModal.status]!;
        const isStarting = next.value === 'started';
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 space-y-5">

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{next.label}</h3>
                  <p className="text-sm text-gray-500">{updateModal.destination} · {updateModal.required_date}</p>
                </div>
                <button onClick={() => setUpdateModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[updateModal.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {updateModal.status?.replace(/_/g, ' ')}
                </span>
                <ChevronRight size={16} className="text-gray-400" />
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[next.value] ?? 'bg-gray-100 text-gray-500'}`}>
                  {next.value.replace(/_/g, ' ')}
                </span>
              </div>

              {/* KM Reading — only for start and complete */}
              {next.requiresKm && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Gauge size={15} />
                      {isStarting ? 'Initial KM Reading' : 'Final KM Reading'}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    value={kmReading}
                    onChange={(e) => setKmReading(e.target.value)}
                    placeholder={isStarting ? 'e.g. 10235' : 'e.g. 10310'}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-sm text-gray-800"
                  />
                  {!isStarting && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      KM traveled will be calculated automatically.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any notes about this update..."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
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
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
              </div>

              {apiError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{apiError}</div>
              )}

              <div className="flex gap-3 pb-1">
                <Button variant="secondary" fullWidth onClick={() => setUpdateModal(null)}>Cancel</Button>
                <Button fullWidth disabled={submitting} onClick={handleUpdate}>
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Updating...
                    </span>
                  ) : next.label}
                </Button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ── Trip Logs Modal ── */}
      {logsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Trip Logs</h3>
                <p className="text-sm text-gray-500">{logsModal.destination} · #{logsModal.id}</p>
              </div>
              <button onClick={() => setLogsModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
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
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 bg-gray-50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[log.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {log.status?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(log.reported_at).toLocaleString()}
                      </span>
                    </div>

                    {log.km_reading != null && (
                      <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Gauge size={14} className="text-gray-400" />
                          <span className="text-gray-500">Odometer:</span>
                          <span className="font-semibold text-gray-800">{log.km_reading.toLocaleString()} km</span>
                        </div>
                        {log.km_traveled != null && (
                          <div className="flex items-center gap-1.5 text-sm ml-auto">
                            <span className="text-gray-500">Traveled:</span>
                            <span className="font-bold text-green-600">{log.km_traveled.toLocaleString()} km</span>
                          </div>
                        )}
                      </div>
                    )}

                    {log.note && <p className="text-sm text-gray-600">{log.note}</p>}
                    {log.location_note && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin size={11} /> {log.location_note}
                      </p>
                    )}
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