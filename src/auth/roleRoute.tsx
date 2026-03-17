import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext';
import type{ ReactNode } from 'react';
import type{ Role } from '../types';

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: Role[];
}

export const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
