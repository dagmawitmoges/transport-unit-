import { useEffect, useState } from 'react';
import { AdminLayout } from '../../layout/adminLayout';
import { getAllVehicles } from '../../api/reports';
import { Loader2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  available:   'bg-green-100 text-green-700',
  in_use:      'bg-yellow-100 text-yellow-700',
  maintenance: 'bg-red-100 text-red-700',
};

export const Vehicles = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getAllVehicles()
      .then(setVehicles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Vehicles</h2>
          <p className="text-sm text-gray-500 mt-1">Fleet managed by the transport unit</p>
        </div>

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
                    {['Plate', 'Make', 'Model', 'Year', 'Type', 'Capacity', 'Status'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{v.plate_number}</td>
                      <td className="px-6 py-4 text-gray-600">{v.make}</td>
                      <td className="px-6 py-4 text-gray-600">{v.model}</td>
                      <td className="px-6 py-4 text-gray-500">{v.year ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500 capitalize">{v.vehicle_type}</td>
                      <td className="px-6 py-4 text-gray-500">{v.capacity ?? '—'} seats</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[v.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {v.status?.replace(/_/g, ' ')}
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
