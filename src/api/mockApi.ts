import type { User, LoginResponse, TransportRequest, Department, RoleOption, DashboardStats, ReportData, Role, UserStatus } from '../types';

const MOCK_USERS: User[] = [
  {
    id: '1',
    full_name: 'Admin User',
    email: 'admin@transport.com',
    role: 'admin',
    department: 'Administration',
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    full_name: 'John Manager',
    email: 'john@transport.com',
    role: 'transport_manager',
    department: 'Operations',
    status: 'active',
    created_at: '2024-01-20T10:00:00Z',
  },
  {
    id: '3',
    full_name: 'Sarah Driver',
    email: 'sarah@transport.com',
    role: 'driver',
    department: 'Fleet',
    status: 'active',
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: '4',
    full_name: 'Mike Employee',
    email: 'mike@transport.com',
    role: 'employee',
    department: 'Sales',
    status: 'active',
    created_at: '2024-02-10T10:00:00Z',
  },
  {
    id: '5',
    full_name: 'Emily Staff',
    email: 'emily@transport.com',
    role: 'employee',
    department: 'Marketing',
    status: 'active',
    created_at: '2024-02-15T10:00:00Z',
  },
];

const MOCK_REQUESTS: TransportRequest[] = [
  {
    id: '1',
    user_id: '4',
    user_name: 'Mike Employee',
    pickup_location: 'Office Building A',
    destination: 'Client Site Downtown',
    date: '2024-03-20',
    time: '09:00',
    notes: 'Meeting with client',
    status: 'approved',
    created_at: '2024-03-15T10:00:00Z',
  },
  {
    id: '2',
    user_id: '5',
    user_name: 'Emily Staff',
    pickup_location: 'Office Building B',
    destination: 'Conference Center',
    date: '2024-03-22',
    time: '14:00',
    notes: 'Marketing event',
    status: 'pending',
    created_at: '2024-03-16T10:00:00Z',
  },
  {
    id: '3',
    user_id: '4',
    user_name: 'Mike Employee',
    pickup_location: 'Airport',
    destination: 'Office',
    date: '2024-03-18',
    time: '16:00',
    notes: 'Return from business trip',
    status: 'approved',
    created_at: '2024-03-14T10:00:00Z',
  },
];

const DEPARTMENTS: Department[] = [
  { id: '1', name: 'Administration' },
  { id: '2', name: 'Operations' },
  { id: '3', name: 'Fleet' },
  { id: '4', name: 'Sales' },
  { id: '5', name: 'Marketing' },
  { id: '6', name: 'IT' },
  { id: '7', name: 'HR' },
  { id: '8', name: 'Finance' },
];

const ROLES: RoleOption[] = [
  { id: 'admin', name: 'Administrator' },
  { id: 'transport_manager', name: 'Transport Manager' },
  { id: 'driver', name: 'Driver' },
  { id: 'employee', name: 'Employee' },
];

let users = [...MOCK_USERS];
let requests = [...MOCK_REQUESTS];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    await delay(500);

    const user = users.find(u => u.email === email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.status === 'inactive') {
      throw new Error('Account is inactive');
    }

    return {
      token: `mock_token_${user.id}`,
      user: {
        id: user.id,
        full_name: user.full_name,
        role: user.role,
        email: user.email,
        department: user.department,
      },
    };
  },

  async getUsers(): Promise<User[]> {
    await delay(300);
    return [...users];
  },

  async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    await delay(400);

    const newUser: User = {
      ...userData,
      id: String(users.length + 1),
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    return newUser;
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    await delay(400);

    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    users[index] = { ...users[index], ...userData };
    return users[index];
  },

  async deactivateUser(id: string): Promise<void> {
    await delay(300);

    const user = users.find(u => u.id === id);
    if (user) {
      user.status = 'inactive';
    }
  },

  async resetPassword(id: string): Promise<string> {
    await delay(300);
    return 'NewPassword123!';
  },

  async getRoles(): Promise<RoleOption[]> {
    await delay(200);
    return [...ROLES];
  },

  async getDepartments(): Promise<Department[]> {
    await delay(200);
    return [...DEPARTMENTS];
  },

  async getDashboardStats(): Promise<DashboardStats> {
    await delay(300);

    return {
      total_users: users.length,
      active_users: users.filter(u => u.status === 'active').length,
      drivers: users.filter(u => u.role === 'driver').length,
      requests: requests.length,
    };
  },

  async getReports(): Promise<ReportData> {
    await delay(400);

    const usersByDept = DEPARTMENTS.map(dept => ({
      department: dept.name,
      count: users.filter(u => u.department === dept.name).length,
    })).filter(d => d.count > 0);

    const requestsByDept = DEPARTMENTS.map(dept => ({
      department: dept.name,
      count: requests.filter(r => {
        const user = users.find(u => u.id === r.user_id);
        return user?.department === dept.name;
      }).length,
    })).filter(d => d.count > 0);

    return {
      users_by_department: usersByDept,
      requests_by_department: requestsByDept,
      requests_over_time: [
        { date: '2024-03-01', count: 5 },
        { date: '2024-03-08', count: 8 },
        { date: '2024-03-15', count: 12 },
        { date: '2024-03-22', count: 7 },
      ],
      total_requests: requests.length,
      approved_requests: requests.filter(r => r.status === 'approved').length,
      rejected_requests: requests.filter(r => r.status === 'rejected').length,
      pending_requests: requests.filter(r => r.status === 'pending').length,
    };
  },

  async getTransportRequests(userId?: string): Promise<TransportRequest[]> {
    await delay(300);

    if (userId) {
      return requests.filter(r => r.user_id === userId);
    }

    return [...requests];
  },

  async createTransportRequest(requestData: Omit<TransportRequest, 'id' | 'created_at' | 'user_name'>): Promise<TransportRequest> {
    await delay(400);

    const user = users.find(u => u.id === requestData.user_id);

    const newRequest: TransportRequest = {
      ...requestData,
      user_name: user?.full_name || 'Unknown',
      id: String(requests.length + 1),
      created_at: new Date().toISOString(),
    };

    requests.push(newRequest);
    return newRequest;
  },

  async updateRequestStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    await delay(300);

    const request = requests.find(r => r.id === id);
    if (request) {
      request.status = status;
    }
  },
};
