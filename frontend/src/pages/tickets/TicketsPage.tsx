import React, { lazy, Suspense } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageLoader } from '@/components/ui';

const AdminTickets = lazy(() => import('./AdminTicketsPage'));
const HelpdeskTickets = lazy(() => import('./HelpdeskTicketsPage'));
const UserTickets = lazy(() => import('./UserTicketsPage'));

const TicketsPage: React.FC = () => {
    const { user } = useAuth();

    return (
        <Suspense fallback={<PageLoader />}>
            {user?.role === 'ADMIN' && <AdminTickets />}
            {user?.role === 'HELPDESK' && <HelpdeskTickets />}
            {user?.role === 'USER' && <UserTickets />}
        </Suspense>
    );
};

export default TicketsPage;
