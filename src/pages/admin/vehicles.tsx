import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from '../../layout/adminLayout';
import { getVehicles, createVehicle } from '../../api/vehicles';
import { Input } from '../../components/input';
import { Button } from '../../components/button';
import { Loader2, Plus, X, Car } from 'lucide-react';

const schema = z.object({
  plate_number: z.string().min(1, 'Plate number is required'),
  make:         z.string().min(1, 'Make is required'),
  model:        z.string().min(1, 'Model is required'),
  year:         z.number().min(1990).max(2100).optional(),
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  capacity:     z.number().min(1).optional(),
  status:       z.string().min(1, 'Status is required'),
  notes:        z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const VEHICLE_TYPES = ['sedan', 'van', 'pickup', 'bus', 'suv'];
const STATUSES      = ['available', 'in_use', 'maintenance'];

const statusColors: Record<string, string> = {
  available:   'bg-green-100 text-green-700',
  in_use:      'bg-blue-100 text-blue-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
};

const typeColors: Record<string, string> = {
  sedan:  'bg-purple-100 text-purple-700',
  van:    'bg-indigo-100 text-indigo-700',
  pickup: 'bg-orange-100 text-orange-700',
  bus:    'bg-red-100 text-red-700',
  suv:    'bg-teal-100 text-teal-700',
};

export const Vehicles = () => {
  const [vehicles, setVehicles]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]   = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'available', vehicle_type: 'sedan' },
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setApiError('');
    try {
      await createVehicle(data);
      reset();
      setShowModal(false);
      fetchVehicles();
    } catch (err: any) {
      setApiError(
        err.response?.data?.errors?.join(', ') ||
        err.response?.data?.error ||
        'Failed to create vehicle.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const available   = vehicles.filter((v) => v.status === 'available').length;
  const inUse       = vehicles.filter((v) => v.status === 'in_use').length;
  const maintenance = vehicles.filter((v) => v.status === 'maintenance').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Vehicles</h2>
            <p className="text-sm text-gray-500 mt-1">Manage the fleet of vehicles</p>
          </div>
          <Button onClick={() => { setShowModal(true); setApiError(''); reset(); }}>
            <span className="flex items-center gap-2">
              <Plus size={16} /> Add Vehicle
            </span>
          </Button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-white rounded-xl px-5 py-3 border border-gray-100 shadow-sm text-sm">
            <span className="text-gray-500">Total: </span>
            <span className="font-bold text-gray-800">{vehicles.length}</span>
          </div>
          <div className="bg-white rounded-xl px-5 py-3 border border-gray-100 shadow-sm text-sm">
            <span className="text-gray-500">Available: </span>
            <span className="font-bold text-green-600">{available}</span>
          </div>
          <div className="bg-white rounded-xl px-5 py-3 border border-gray-100 shadow-sm text-sm">
            <span className="text-gray-500">In Use: </span>
            <span className="font-bold text-blue-600">{inUse}</span>
          </div>
          <div className="bg-white rounded-xl px-5 py-3 border border-gray-100 shadow-sm text-sm">
            <span className="text-gray-500">Maintenance: </span>
            <span className="font-bold text-yellow-600">{maintenance}</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">No vehicles found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Plate</th>
                    <th className="px-6 py-3 text-left font-medium">Make & Model</th>
                    <th className="px-6 py-3 text-left font-medium">Year</th>
                    <th className="px-6 py-3 text-left font-medium">Type</th>
                    <th className="px-6 py-3 text-left font-medium">Capacity</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800">{v.plate_number}</td>
                      <td className="px-6 py-4 text-gray-800">{v.make} {v.model}</td>
                      <td className="px-6 py-4 text-gray-500">{v.year ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${typeColors[v.vehicle_type] ?? 'bg-gray-100 text-gray-500'}`}>
                          {v.vehicle_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{v.capacity ?? '—'} seats</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[v.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {v.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 italic">{v.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Create Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                  <Car size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Add New Vehicle</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Plate Number"
                placeholder="e.g. AU-005-ET"
                error={errors.plate_number?.message}
                {...register('plate_number')}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Make"
                  placeholder="e.g. Toyota"
                  error={errors.make?.message}
                  {...register('make')}
                />
                <Input
                  label="Model"
                  placeholder="e.g. Land Cruiser"
                  error={errors.model?.message}
                  {...register('model')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Year"
                  type="number"
                  placeholder="e.g. 2023"
                  error={errors.year?.message}
                  {...register('year', { valueAsNumber: true })}
                />
                <Input
                  label="Capacity (seats)"
                  type="number"
                  placeholder="e.g. 7"
                  error={errors.capacity?.message}
                  {...register('capacity', { valueAsNumber: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle Type</label>
                  <select
                    className={`w-full px-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${errors.vehicle_type ? 'border-red-400' : ''}`}
                    {...register('vehicle_type')}
                  >
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                  {errors.vehicle_type && <p className="mt-1 text-sm text-red-500">{errors.vehicle_type.message}</p>}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select
                    className={`w-full px-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${errors.status ? 'border-red-400' : ''}`}
                    {...register('status')}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ').charAt(0).toUpperCase() + s.replace(/_/g, ' ').slice(1)}</option>
                    ))}
                  </select>
                  {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Any additional notes..."
                  className="w-full px-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
                  {...register('notes')}
                />
              </div>

              {apiError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{apiError}</div>
              )}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="secondary" fullWidth onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" fullWidth disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Adding...
                    </span>
                  ) : 'Add Vehicle'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
