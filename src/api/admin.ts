import API from './axios';

export const getUsers = async () => {
  const res = await API.get('/api/v1/users');
  const included = res.data.included ?? [];
  return res.data.data.map((item: any) => ({
    id: item.id,
    ...item.attributes,
    department: included.find((d: any) => d.id === item.relationships?.department?.data?.id)?.attributes ?? null,
  }));
};

export const getTransportRequests = async (filters?: { status?: string; date?: string }) => {
  const params: Record<string, string> = {};
  if (filters?.status) params.status = filters.status;
  if (filters?.date)   params.date   = filters.date;

  const res = await API.get('/api/v1/transport_requests', { params });
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