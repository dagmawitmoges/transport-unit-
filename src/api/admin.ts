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
    const reviewedById = item.relationships?.reviewed_by?.data?.id;
    const assignedById = item.relationships?.assigned_by?.data?.id;

    const requester  = included.find((i: any) => i.type === 'user'       && i.id === requesterId);
    const department = included.find((i: any) => i.type === 'department' && i.id === departmentId);
    const reviewedBy = included.find((i: any) => i.type === 'user'       && i.id === reviewedById);
    const assignedBy = included.find((i: any) => i.type === 'user'       && i.id === assignedById);

    return {
      id: item.id,
      ...item.attributes,
      requester:   requester?.attributes  ?? null,
      department:  department?.attributes ?? null,
      reviewed_by: reviewedBy?.attributes ?? null,
      assigned_by: assignedBy?.attributes ?? null,
    };
  });
};

// Fetch single request with full detail — assignment, driver, vehicle, trip updates
export const getRequestDetail = async (requestId: string) => {
  const res = await API.get(`/api/v1/transport_requests/${requestId}`);
  const included = res.data.included ?? [];
  const item = res.data.data;

  const requesterId    = item.relationships?.requester?.data?.id;
  const departmentId   = item.relationships?.department?.data?.id;
  const reviewedById   = item.relationships?.reviewed_by?.data?.id;
  const assignedById   = item.relationships?.assigned_by?.data?.id;
  const assignmentData = item.relationships?.assignment?.data;
  const tripUpdatesData = item.relationships?.trip_status_updates?.data ?? [];

  const requester  = included.find((i: any) => i.type === 'user'       && i.id === requesterId);
  const department = included.find((i: any) => i.type === 'department' && i.id === departmentId);
  const reviewedBy = included.find((i: any) => i.type === 'user'       && i.id === reviewedById);
  const assignedBy = included.find((i: any) => i.type === 'user'       && i.id === assignedById);
  const assignment = assignmentData
    ? included.find((i: any) => i.type === 'assignment' && i.id === assignmentData.id)
    : null;

  // Get driver and vehicle from assignment relationships
  const driverId  = assignment?.relationships?.driver?.data?.id;
  const vehicleId = assignment?.relationships?.vehicle?.data?.id;
  const driver    = included.find((i: any) => i.type === 'driver'  && i.id === driverId);
  const vehicle   = included.find((i: any) => i.type === 'vehicle' && i.id === vehicleId);

  // Trip status updates with KM data
  const tripUpdates = tripUpdatesData.map((t: any) => {
    const update = included.find((i: any) => i.type === 'trip_status_update' && i.id === t.id);
    return update ? { id: update.id, ...update.attributes } : null;
  }).filter(Boolean);

  return {
    id: item.id,
    ...item.attributes,
    requester:          requester?.attributes  ?? null,
    department:         department?.attributes ?? null,
    reviewed_by:        reviewedBy?.attributes ?? null,
    assigned_by:        assignedBy?.attributes ?? null,
    assignment:         assignment ? { id: assignment.id, ...assignment.attributes } : null,
    driver:             driver    ? { id: driver.id,    ...driver.attributes }    : null,
    vehicle:            vehicle   ? { id: vehicle.id,   ...vehicle.attributes }   : null,
    trip_status_updates: tripUpdates,
  };
};