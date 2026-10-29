import { useEffect, useState } from 'react';
import { StaffLayout } from '../../layout/stafflayouts';
import { getMyTrips, completeTrip } from '../../api/driver';
import { Button } from '../../components/button';
import { Loader2, Flag, X } from 'lucide-react';
import { formatTime } from '../../utils/time';

const statusColors: Record<string, string> = {
  assigned:    'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed:   'bg-green-100 text-green-700',
};

const emptyForm = { departure_at: '', arrival_at: '', start_km: '', end_km: '', note: '' };

export const DriverTrips = () => {
  const [trips, setTrips]           = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [modalTrip, setModalTrip]   = useState<any | null>(null);
  const [form, setForm]             = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const fetchTrips = async () => {
    setLoading(true);
    try {
      setTrips(await getMyTrips());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const openComplete = (trip: any) => {
    setModalTrip(trip);
    setForm(emptyForm);
    setError('');
  };

  const update = (key: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!modalTrip) return;
    const start = Number(form.start_km);
    const end   = Number(form.end_km);

    if (!form.departure_at || !form.arrival_at || form.start_km === '' || form.end_km === '') {
      setError('Departure, arrival, start KM and end KM are required.');
      return;
    }
    if (new Date(form.arrival_at) < new Date(form.departure_at)) {
      setError('Arrival time must be after the departure time.');
      return;
    }
    if (end < start) {
      setError('End KM cannot be less than start KM.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await completeTrip(modalTrip.id, {
        departure_at: new Date(form.departure_at).toISOString(),
        arrival_at:   new Date(form.arrival_at).toISOString(),
        start_km:     start,
        km_reading:   end,
        note:         form.note || undefined,
      });
      setModalTrip(null);
      await fetchTrips();
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.errors?.join(', ') || data?.error || 'Could not complete the trip.');
    } finally {
      setSubmitting(false);
    }
  };

  const active = trips.filter((t) => t.status === 'assigned' || t.status === 'in_progress');

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Trips</h2>
          <p className="text-sm text-gray-500 mt-1">Trips assigned to you. Complete a trip to record its details.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 text-sm text-gray-600">
            Active trips: <span className="font-semibold text-gray-800">{active.length}</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 text-sm text-gray-600">
            Completed: <span className="font-semibold text-gray-800">{trips.filter((t) => t.status === 'completed').length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">No trips assigned to you yet.</div>
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
                    <th className="px-6 py-3 text-left font-medium">Passengers</th>
                    <th className="px-6 py-3 text-left font-medium">Vehicle</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {trips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">#{trip.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {trip.requester ? `${trip.requester.first_name} ${trip.requester.last_name}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{trip.destination}</td>
                      <td className="px-6 py-4 text-gray-500">{trip.required_date}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {formatTime(trip.required_from_time)} – {formatTime(trip.required_to_time)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{trip.passenger_count ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500">{trip.vehicle?.plate_number ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[trip.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {trip.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {(trip.status === 'assigned' || trip.status === 'in_progress') && (
                          <button
                            onClick={() => openComplete(trip)}
                            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            <Flag size={14} /> Complete trip
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setModalTrip(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Complete trip #{modalTrip.id}</h3>
                <p className="text-sm text-gray-500">{modalTrip.destination}</p>
              </div>
              <button onClick={() => setModalTrip(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-gray-600 col-span-2 sm:col-span-1">
                Departure time
                <input type="datetime-local" value={form.departure_at} onChange={(e) => update('departure_at', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </label>
              <label className="text-sm text-gray-600 col-span-2 sm:col-span-1">
                Arrival time
                <input type="datetime-local" value={form.arrival_at} onChange={(e) => update('arrival_at', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </label>
              <label className="text-sm text-gray-600">
                Start KM
                <input type="number" min={0} value={form.start_km} onChange={(e) => update('start_km', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </label>
              <label className="text-sm text-gray-600">
                End KM
                <input type="number" min={0} value={form.end_km} onChange={(e) => update('end_km', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </label>
            </div>

            <label className="block text-sm text-gray-600">
              Remarks (optional)
              <textarea rows={2} value={form.note} onChange={(e) => update('note', e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </label>

            {form.start_km !== '' && form.end_km !== '' && Number(form.end_km) >= Number(form.start_km) && (
              <p className="text-sm text-gray-500">Total distance: <span className="font-semibold text-gray-800">{Number(form.end_km) - Number(form.start_km)} km</span></p>
            )}

            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-1">
              <Button variant="secondary" onClick={() => setModalTrip(null)} fullWidth>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting} fullWidth>
                {submitting ? 'Saving...' : 'Complete trip'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};
