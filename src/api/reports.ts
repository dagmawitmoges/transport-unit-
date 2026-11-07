import API from './axios';

export interface ReportFilters {
  from?: string;
  to?: string;
  department_id?: string;
  driver_id?: string;
  vehicle_id?: string;
}

export interface TripRow {
  request_id: number;
  department: string | null;
  requester: string | null;
  purpose: string;
  destination: string;
  driver: string | null;
  vehicle_plate: string | null;
  departure_time: string | null;
  arrival_time: string | null;
  start_km: number | null;
  end_km: number | null;
  total_km: number | null;
  status: string;
}

const clean = (filters: ReportFilters) =>
  Object.fromEntries(Object.entries(filters).filter(([, value]) => value));

export const getTripReport = async (filters: ReportFilters): Promise<TripRow[]> => {
  const res = await API.get('/api/v1/reports/trips', { params: clean(filters) });
  return res.data.data;
};

/** Downloads the .xlsx report with the same filters as the on-screen table. */
export const downloadTripReport = async (filters: ReportFilters) => {
  const res = await API.get('/api/v1/reports/trips.xlsx', {
    params: clean(filters),
    responseType: 'blob',
  });

  const url = URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transport-trips-${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

export const getAllDrivers = async () => {
  const res = await API.get('/api/v1/drivers');
  const included = res.data.included ?? [];
  return res.data.data.map((item: any) => {
    const user = included.find(
      (i: any) => i.type === 'user' && i.id === item.relationships?.user?.data?.id
    )?.attributes;
    return { id: item.id, name: user ? `${user.first_name} ${user.last_name}` : `Driver ${item.id}` };
  });
};

export const getAllVehicles = async () => {
  const res = await API.get('/api/v1/vehicles');
  return res.data.data.map((item: any) => ({
    id: item.id,
    ...item.attributes,
  }));
};
