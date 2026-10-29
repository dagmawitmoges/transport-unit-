import { useEffect, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { AdminLayout } from '../../layout/adminLayout';
import { StaffLayout } from '../../layout/stafflayouts';
import { getDepartments } from '../../api/users';
import {
  getTripReport,
  downloadTripReport,
  getAllDrivers,
  getAllVehicles,
} from '../../api/reports';
import type { ReportFilters, TripRow } from '../../api/reports';
import { Download, Loader2 } from 'lucide-react';

const formatDateTime = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const deptLabel = (name: string | null) => {
  if (!name) return '—';
  const label = name.replace(/_/g, ' ');
  return label.length <= 3 ? label.toUpperCase() : label.replace(/^./, (c) => c.toUpperCase());
};

const inputClass =
  'w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';

const ReportContent = () => {
  const [filters, setFilters]         = useState<ReportFilters>({});
  const [rows, setRows]               = useState<TripRow[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [drivers, setDrivers]         = useState<any[]>([]);
  const [vehicles, setVehicles]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [exporting, setExporting]     = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    Promise.all([getDepartments(), getAllDrivers(), getAllVehicles()])
      .then(([d, dr, v]) => { setDepartments(d); setDrivers(dr); setVehicles(v); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    getTripReport(filters)
      .then(setRows)
      .catch(() => setError('Failed to load the report.'))
      .finally(() => setLoading(false));
  }, [filters]);

  const set = (key: keyof ReportFilters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadTripReport(filters);
    } catch {
      setError('Excel export failed.');
    } finally {
      setExporting(false);
    }
  };

  const totalKm = rows.reduce((sum, r) => sum + (r.total_km ?? 0), 0);
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Trip Reports</h2>
          <p className="text-sm text-gray-500 mt-1">Completed trips, with Excel export</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || rows.length === 0}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1f5c52] text-white text-sm font-medium shadow hover:bg-[#194a42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Export to Excel
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-xs text-gray-500 w-full sm:w-auto">
          From
          <input type="date" value={filters.from ?? ''} onChange={(e) => set('from', e.target.value)} className={`${inputClass} block mt-1`} />
        </label>
        <label className="text-xs text-gray-500 w-full sm:w-auto">
          To
          <input type="date" value={filters.to ?? ''} onChange={(e) => set('to', e.target.value)} className={`${inputClass} block mt-1`} />
        </label>
        <select value={filters.department_id ?? ''} onChange={(e) => set('department_id', e.target.value)} className={inputClass}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={filters.driver_id ?? ''} onChange={(e) => set('driver_id', e.target.value)} className={inputClass}>
          <option value="">All drivers</option>
          {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={filters.vehicle_id ?? ''} onChange={(e) => set('vehicle_id', e.target.value)} className={inputClass}>
          <option value="">All vehicles</option>
          {vehicles.map((v) => <option key={v.id} value={v.id}>{v.plate_number}</option>)}
        </select>
        {hasFilters && (
          <button onClick={() => setFilters({})} className="w-full sm:w-auto px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl">
            Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 text-sm text-gray-600">
          Trips: <span className="font-semibold text-gray-800">{rows.length}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 text-sm text-gray-600">
          Total distance: <span className="font-semibold text-gray-800">{totalKm} km</span>
        </div>
      </div>

      {error && <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-blue-500" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No completed trips match these filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  {['ID', 'Department', 'Requester', 'Purpose', 'Destination', 'Driver', 'Vehicle', 'Departure', 'Arrival', 'Start KM', 'End KM', 'Total KM', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.request_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">#{r.request_id}</td>
                    <td className="px-4 py-3 text-gray-600">{deptLabel(r.department)}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{r.requester}</td>
                    <td className="px-4 py-3 text-gray-600">{r.purpose}</td>
                    <td className="px-4 py-3 text-gray-600">{r.destination}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.driver}</td>
                    <td className="px-4 py-3 text-gray-600">{r.vehicle_plate ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(r.departure_time)}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(r.arrival_time)}</td>
                    <td className="px-4 py-3 text-gray-500">{r.start_km ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.end_km ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{r.total_km ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-green-100 text-green-700">
                        {r.status.replace(/_/g, ' ')}
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
  );
};

const withLayout = (Layout: ComponentType<{ children: ReactNode }>) => () => (
  <Layout>
    <ReportContent />
  </Layout>
);

export const AdminTripReport = withLayout(AdminLayout);
export const StaffTripReport = withLayout(StaffLayout);
