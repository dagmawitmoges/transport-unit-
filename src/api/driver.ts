import API from './axios';

export const getDriverTrips = async () => {
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

export const updateTripStatus = async (
  requestId: string,
  data: { status: string; note?: string; location_note?: string }
) => {
  const res = await API.post(
    `/api/v1/transport_requests/${requestId}/trip_status_updates`,
    { trip_status_update: data }
  );
  return res.data;
};

export const getTripStatusUpdates = async (requestId: string) => {
  const res = await API.get(
    `/api/v1/transport_requests/${requestId}/trip_status_updates`
  );
  return res.data.data?.map((item: any) => ({
    id: item.id,
    ...item.attributes,
  })) ?? [];
};