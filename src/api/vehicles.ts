import API from './axios';

export const getVehicles = async () => {
  const res = await API.get('/api/v1/vehicles');
  return res.data.data.map((item: any) => ({
    id: item.id,
    ...item.attributes,
  }));
};

export const createVehicle = async (data: {
  plate_number: string;
  make: string;
  model: string;
  year?: number;
  vehicle_type: string;
  capacity?: number;
  status: string;
  notes?: string;
}) => {
  const res = await API.post('/api/v1/vehicles', { vehicle: data });
  return res.data;
};