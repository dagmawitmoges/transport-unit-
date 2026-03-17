import { useState, useEffect } from 'react';
import { AdminLayout } from '../../layout/adminLayout';
import { StatCard } from '../../components/statCard';
import { Card } from '../../components/card';
import { Table } from '../../components/table';
import { Users, UserCheck, Car, FileText } from 'lucide-react';
import { mockApi } from '../../api/mockApi';
import type{ DashboardStats, User } from '../../types';
import { useAuth } from '../../auth/authContext';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, usersData] = await Promise.all([
          mockApi.getDashboardStats(),
          mockApi.getUsers(),
        ]);

        setStats(statsData);
        setRecentUsers(usersData.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-gray-600">Here's what's happening with your system today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.total_users || 0}
            icon={Users}
            iconColor="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <StatCard
            title="Active Users"
            value={stats?.active_users || 0}
            icon={UserCheck}
            iconColor="bg-gradient-to-r from-green-500 to-green-600"
          />
          <StatCard
            title="Drivers"
            value={stats?.drivers || 0}
            icon={Car}
            iconColor="bg-gradient-to-r from-orange-500 to-orange-600"
          />
          <StatCard
            title="Requests"
            value={stats?.requests || 0}
            icon={FileText}
            iconColor="bg-gradient-to-r from-purple-500 to-purple-600"
          />
        </div>

        <Card title="Recent Users">
          <Table<User>
            columns={[
              { key: 'full_name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role' },
              { key: 'department', label: 'Department' },
              {
                key: 'status',
                label: 'Status',
                render: (value) => (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      value === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {String(value)}
                  </span>
                ),
              },
            ]}
            data={recentUsers}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};
