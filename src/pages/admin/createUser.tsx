import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../layout/adminLayout';
import { Card } from '../../components/card';
import { Input } from '../../components/input';
import { Select } from '../../components/select';
import { Button } from '../../components/button';
import { Modal } from '../../components/modal';
import { mockApi } from '../../api/mockApi';
import type{ Department, RoleOption } from '../../types';
import { ArrowLeft } from 'lucide-react';

export const CreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: '',
    department: '',
  });
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [rolesData, departmentsData] = await Promise.all([
        mockApi.getRoles(),
        mockApi.getDepartments(),
      ]);
      setRoles(rolesData);
      setDepartments(departmentsData);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await mockApi.createUser({
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role as any,
        department: formData.department,
        status: 'active',
      });

      const password = 'Welcome123!';
      setGeneratedPassword(password);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/admin/users');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Users
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Create User</h1>
          <p className="text-gray-600 mt-1">Add a new user to the system</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="john@transport.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />

            <Select
              label="Role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              options={roles.map((role) => ({
                value: role.id,
                label: role.name,
              }))}
              required
            />

            <Select
              label="Department"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              options={departments.map((dept) => ({
                value: dept.name,
                label: dept.name,
              }))}
              required
            />

            <div className="flex space-x-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/users')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        <Modal
          isOpen={showSuccessModal}
          onClose={handleModalClose}
          title="User Created Successfully"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              User <strong>{formData.full_name}</strong> has been created successfully.
            </p>
            <div className="p-4 bg-blue-50 rounded-xl space-y-2">
              <div>
                <p className="text-sm text-gray-600">Email:</p>
                <p className="font-semibold text-gray-800">{formData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Temporary Password:</p>
                <p className="text-lg font-mono font-bold text-blue-700">
                  {generatedPassword}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Please share these credentials securely with the user.
            </p>
            <Button onClick={handleModalClose} fullWidth>
              Close
            </Button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};
