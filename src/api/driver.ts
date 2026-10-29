import API from './axios';

/** Trips assigned to the signed-in driver (the API scopes the list by role). */
export const getMyTrips = async () => {
  const res = await API.get('/api/v1/transport_requests', { params: { per_page: 100 } });
  const included = res.data.included ?? [];
  const find = (type: string, id?: string) =>
    included.find((i: any) => i.type === type && i.id === id)?.attributes ?? null;

  return res.data.data.map((item: any) => {
    const assignment = included.find(
      (i: any) => i.type === 'assignment' && i.id === item.relationships?.assignment?.data?.id
    );
    const vehicleId = assignment?.relationships?.vehicle?.data?.id;

    return {
      id: item.id,
      ...item.attributes,
      requester: find('user', item.relationships?.requester?.data?.id),
      department: find('department', item.relationships?.department?.data?.id),
      assignment: assignment?.attributes ?? null,
      vehicle: find('vehicle', vehicleId),
    };
  });
};

export interface CompleteTripData {
  departure_at: string;
  arrival_at: string;
  start_km: number;
  km_reading: number;
  note?: string;
}

/** Marks the trip completed and records departure/arrival times and odometer readings. */
export const completeTrip = async (requestId: string, data: CompleteTripData) => {
  const res = await API.post(`/api/v1/transport_requests/${requestId}/trip_status_updates`, {
    trip_status_update: { status: 'completed', ...data },
  });
  return res.data;
};
