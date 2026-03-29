import API from './axios';
export const getUsers = async () => {
  const res = await API.get('/api/v1/users');
  
  // Map JSON:API format to flat objects
  const included = res.data.included ?? [];
  
  return res.data.data.map((item: any) => ({
    id: item.id,
    ...item.attributes,
    department: included.find((d: any) => d.id === item.relationships?.department?.data?.id)?.attributes ?? null,
  }));
};

export const createUser = async (data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  department_id: string;
  telephone_extension?: string;
}) => {
  const res = await API.post('/api/v1/users', { user: data });
  return res.data;
};

export const deactivateUser = async (id: string) => {
  const res = await API.delete(`/api/v1/users/${id}`);
  return res.data;
};

export const getDepartments = async () => {
  const res = await API.get('/api/v1/departments');
  
  return res.data.data.map((item: any) => ({
    id: item.id,
    ...item.attributes,
  }));
};