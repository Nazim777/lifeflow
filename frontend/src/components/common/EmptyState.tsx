import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            {Icon && (
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Icon className="w-6 h-6" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            {description && <p className="text-gray-500 max-w-sm mb-6">{description}</p>}
            {action}
        </div>
    );
};
