import React from 'react';
import { Spinner } from './Spinner';

export const PageLoader: React.FC = () => {
    return (
        <div className="flex h-[50vh] w-full items-center justify-center">
            <Spinner size="lg" />
        </div>
    );
};
