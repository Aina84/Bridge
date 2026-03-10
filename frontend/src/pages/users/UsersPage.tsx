import React, { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageLoader } from '@/components/ui';

const AdminUsersPage = lazy(() => import('./AdminUsersPage'));

const UsersPage: React.FC = () => {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <AdminUsersPage />
    </Suspense>
  );
};

export default UsersPage;
