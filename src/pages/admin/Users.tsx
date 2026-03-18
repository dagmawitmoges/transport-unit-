import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdminLayout } from '../../layout/adminLayout';
import { getUsers, createUser, deactivateUser, getDepartments } from '../../api/users';
import { createUserSchema, type CreateUserFormData } from '../../schemas/userSchema';
import { Input } from '../../components/input';
import { Button } from '../../components/button';
import { UserPlus, X, Loader2, Search, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../auth/authContext';

const ROLES = [
  { value: 'admin',                 label: 'Admin' },
  { value: 'dispatcher',            label: 'Dispatcher' },
  { value: 'dispatcher_supervisor', label: 'Dispatcher Supervisor' },
  { value: 'supervisor',            label: 'Supervisor' },
  { value: 'director',              label: 'Director' },
  { value: 'requester',             label: 'Requester' },
  { value: 'driver',                label: 'Driver' },
];

const roleBadgeColors: Record<string, string> = {
  admin:                 'bg-purple-100 text-purple-700',
  dispatcher:            'bg-blue-100 text-blue-700',
  dispatcher_supervisor: 'bg-indigo-100 text-indigo-700',
  supervisor:            'bg-yellow-100 text-yellow-700',
  director:              'bg-red-100 text-red-700',
  requester:             'bg-green-100 text-green-700',
  driver:                'bg-orange-100 text-orange-700',
};

export const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<any | null>(null);
  const { user: currentUser } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const fetchData = async () => {
    try {
      const [usersData, depsData] = await Promise.all([getUsers(), getDepartments()]);
      setUsers(Array.isArray(usersData) ? usersData : usersData.data ?? []);
      setDepartments(Array.isArray(depsData) ? depsData : depsData.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: CreateUserFormData) => {
    setSubmitting(true);
    setApiError('');
    try {
      await createUser(data);
      reset();
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      const msg =
        err.response?.data?.errors?.join(', ') ||
        err.response?.data?.error ||
        'Failed to create user.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (user: any) => {
    setDeactivatingId(user.id);
    try {
      await deactivateUser(user.id);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeactivatingId(null);
      setConfirmDeactivate(null);
    }
  };

  const filtered = users.filter((u) => {
    const name = `${u.first_name ?? ''} ${u.last_name ?? ''} ${u.full_name ?? ''} ${u.email ?? ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Users</h2>
            <p className="text-sm text-gray-500 mt-1">Manage system users and roles</p>
          </div>
          <Button onClick={() => { setShowModal(true); setApiError(''); reset(); }}>
            <span className="flex items-center gap-2">
              <UserPlus size={16} />
              Add User
            </span>
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Name</th>
                    <th className="px-6 py-3 text-left font-medium">Email</th>
                    <th className="px-6 py-3 text-left font-medium">Role</th>
                    <th className="px-6 py-3 text-left font-medium">Department</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {user.full_name ?? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${roleBadgeColors[user.role] ?? 'bg-gray-100 text-gray-500'}`}>
                          {user.role?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
{user.department?.code ?? '—'}                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${user.active === false ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                          {user.active === false ? 'Inactive' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.active !== false && currentUser?.id !== user.id && (
  <button
    onClick={() => setConfirmDeactivate(user)}
    className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
  >
    Deactivate
  </button>
)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Create User Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Create New User</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="John"
                  error={errors.first_name?.message}
                  {...register('first_name')}
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  error={errors.last_name?.message}
                  {...register('last_name')}
                />
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Role Select */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                  <select
                    className={`w-full px-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${errors.role ? 'border-red-400' : ''}`}
                    {...register('role')}
                  >
                    <option value="">Select role</option>
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>}
                </div>

                {/* Department Select */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                  <select
                    className={`w-full px-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${errors.department_id ? 'border-red-400' : ''}`}
                    {...register('department_id')}
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
<option key={d.id} value={d.id}>{d.name ?? d.code}</option>                    ))}
                  </select>
                  {errors.department_id && <p className="mt-1 text-sm text-red-500">{errors.department_id.message}</p>}
                </div>
              </div>

              <Input
                label="Telephone Extension"
                placeholder="e.g. 1234"
                error={errors.telephone_extension?.message}
                {...register('telephone_extension')}
              />

              {apiError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                  {apiError}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="secondary" fullWidth onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" fullWidth disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Creating...
                    </span>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Deactivate Modal ── */}
      {confirmDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-xl">
                <ShieldAlert size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Deactivate User</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to deactivate{' '}
              <span className="font-semibold">
                {confirmDeactivate.full_name ?? `${confirmDeactivate.first_name} ${confirmDeactivate.last_name}`}
              </span>?
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setConfirmDeactivate(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                fullWidth
                disabled={deactivatingId === confirmDeactivate.id}
                onClick={() => handleDeactivate(confirmDeactivate)}
              >
                {deactivatingId === confirmDeactivate.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Deactivating...
                  </span>
                ) : (
                  'Deactivate'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};