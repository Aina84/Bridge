import React, { lazy, Suspense } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageLoader } from '@/components/ui';

const AdminDashboard = lazy(() => import('./AdminDashboardPage'));
const HelpdeskDashboard = lazy(() => import('./HelpdeskDashboardPage'));
const UserDashboard = lazy(() => import('./UserDashboardPage'));

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      {user?.role === 'ADMIN' && <AdminDashboard />}
      {user?.role === 'HELPDESK' && <HelpdeskDashboard />}
      {user?.role === 'USER' && <UserDashboard />}
    </Suspense>
  );
};

export default DashboardPage;
