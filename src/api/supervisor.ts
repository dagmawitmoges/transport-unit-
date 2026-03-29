import API from './axios';

export const approveRequest = async (id: string) => {
  const res = await API.post(`/api/v1/transport_requests/${id}/approve`);
  return res.data;
};

export const rejectRequest = async (id: string, rejection_reason: string) => {
  const res = await API.post(`/api/v1/transport_requests/${id}/reject`, {
    transport_request: { rejection_reason },
  });
  return res.data;
};