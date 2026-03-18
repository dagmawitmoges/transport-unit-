import API from './axios';

export const getAvailableDrivers = async () => {
  const res = await API.get('/api/v1/drivers/available');
  return res.data.data.map((item: any) => ({
    id: item.id,
    ...item.attributes,
  }));
};

export const getAvailableVehicles = async () => {
  const res = await API.get('/api/v1/vehicles/available');
  return res.data.data.map((item: any) => ({
    id: item.id,
    ...item.attributes,
  }));
};

export const assignRequest = async (
  requestId: string,
  data: { driver_id: string; vehicle_id: string; notes?: string }
) => {
  const res = await API.post(`/api/v1/transport_requests/${requestId}/assignment`, {
    assignment: data,
  });
  return res.data;
};