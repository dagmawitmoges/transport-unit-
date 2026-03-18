import API from './axios';

export const getMyTransportRequests = async () => {
  const res = await API.get('/api/v1/transport_requests');
  return res.data.data.map((item: any) => ({
    id: item.id,
    ...item.attributes,
  }));
};

export const createTransportRequest = async (data: {
  originator_office: string;
  telephone_extension: string;
  required_date: string;
  required_from_time: string;
  required_to_time: string;
  working_hours: boolean;
  destination: string;
  purpose: string;
  service_type: 'passenger' | 'pickup';
  passenger_count?: number;
}) => {
  const res = await API.post('/api/v1/transport_requests', {
    transport_request: data,
  });
  return res.data;
};

export const cancelTransportRequest = async (id: string) => {
  const res = await API.delete(`/api/v1/transport_requests/${id}`);
  return res.data;
};