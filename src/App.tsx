import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/authContext';
import { ProtectedRoute } from './auth/protectedRoute';
import { RoleRoute } from './auth/roleRoute';
import { Login } from './pages/login';
import { Unauthorized } from './pages/unauthorized';
import { AdminDashboard } from './pages/admin/dashboard';
import { Users } from './pages/admin/Users';
import { StaffDashboard } from './pages/staff/staffdashboard';
import { CreateRequest } from './pages/staff/createRequests';
import { MyRequests } from './pages/staff/myRequests';
import type { Role } from './types';

const STAFF_ROLES = [
  'dispatcher',
  'dispatcher_supervisor',
  'supervisor',
  'director',
  'requester',
  'driver',
] as Role[];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <Users />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={STAFF_ROLES}>
                  <StaffDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/request"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={STAFF_ROLES}>
                  <CreateRequest />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/requests"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={STAFF_ROLES}>
                  <MyRequests />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;