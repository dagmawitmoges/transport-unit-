import API from './axios';



export const getTransportRequests = async () => {
  const res = await API.get('/api/v1/transport_requests');
  return res.data.data.map((item: any) => ({
    id: item.id,
    ...item.attributes,
  }));
};

export const getUsers = async () => {
  const res = await API.get('/api/v1/users');
  return res.data.data.map((item: any) => ({
    id: item.id,
    ...item.attributes,
  }));
};