import React, { lazy, Suspense } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageLoader } from '@/components/ui';

const HelpdeskTicketDetail = lazy(() => import('./HelpdeskTicketDetailPage'));
const UserTicketDetail = lazy(() => import('./UserTicketDetailPage'));

const TicketDetailPage: React.FC = () => {
    const { user } = useAuth();

    return (
        <Suspense fallback={<PageLoader />}>
            {(user?.role === 'HELPDESK' || user?.role === 'ADMIN') ? (
                <HelpdeskTicketDetail />
            ) : (
                <UserTicketDetail />
            )}
        </Suspense>
    );
};

export default TicketDetailPage;
