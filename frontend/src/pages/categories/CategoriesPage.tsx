import React, { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageLoader } from '@/components/ui';

const AdminCategoriesPage = lazy(() => import('./AdminCategoriesPage'));

const CategoriesPage: React.FC = () => {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <AdminCategoriesPage />
    </Suspense>
  );
};

export default CategoriesPage;
