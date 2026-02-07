import type { ReactNode } from 'react';

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}

export const DashboardHeader = ({ title, subtitle, actions }: DashboardHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex gap-3">{actions}</div>}
        </div>
    );
};
