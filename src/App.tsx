import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/authContext';
import { ProtectedRoute } from './auth/protectedRoute';
import { RoleRoute } from './auth/roleRoute';
import { Login } from './pages/login';
import { Unauthorized } from './pages/unauthorized';
import { AdminDashboard } from './pages/admin/dashboard';
import { CreateUser } from './pages/admin/createUser';
// import { AdminDashboard } from './pages/admin/Dashboard';
// import { Users } from './pages/admin/Users';
// import { CreateUser } from './pages/admin/CreateUser';
// import { Reports } from './pages/admin/Reports';
// import { Roles } from './pages/admin/Roles';
// import { Departments } from './pages/admin/Departments';
// import { StaffDashboard } from './pages/staff/Dashboard';
// import { RequestTransport } from './pages/staff/RequestTransport';
// import { MyRequests } from './pages/staff/MyRequests';
// import { Profile } from './pages/staff/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

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
          {/* <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <Users />
                </RoleRoute>
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/admin/users/create"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <CreateUser />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <Reports />
                </RoleRoute>
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/admin/roles"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <Roles />
                </RoleRoute>
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/admin/departments"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <Departments />
                </RoleRoute>
              </ProtectedRoute>
            }
          /> */}

          {/* <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['transport_manager', 'driver', 'employee']}>
                  <StaffDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/staff/request-transport"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['transport_manager', 'driver', 'employee']}>
                  <RequestTransport />
                </RoleRoute>
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/staff/my-requests"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['transport_manager', 'driver', 'employee']}>
                  <MyRequests />
                </RoleRoute>
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/staff/profile"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['transport_manager', 'driver', 'employee']}>
                  <Profile />
                </RoleRoute>
              </ProtectedRoute>
            }
          /> */}

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
