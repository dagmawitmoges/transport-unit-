import API from './axios';

export const getMyTransportRequests = async () => {
  const res = await API.get('/api/v1/transport_requests');
  const included = res.data.included ?? [];

  return res.data.data.map((item: any) => {
    const requesterId  = item.relationships?.requester?.data?.id;
    const departmentId = item.relationships?.department?.data?.id;

    const requester  = included.find((i: any) => i.type === 'user'       && i.id === requesterId);
    const department = included.find((i: any) => i.type === 'department' && i.id === departmentId);

    return {
      id: item.id,
      ...item.attributes,
      requester:  requester?.attributes  ?? null,
      department: department?.attributes ?? null,
    };
  });
};

export const createTransportRequest = async (data: {
  originator_office: string;
  telephone_extension: string;
  department_id: string;
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