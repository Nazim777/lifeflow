import clsx from 'clsx';
import { CheckCircle, Clock, XCircle, AlertOctagon, AlertCircle } from 'lucide-react';

export type StatusType = 'pending' | 'accepted' | 'completed' | 'cancelled' | 'expired' | 'critical' | 'verified' | 'rejected' | string;

interface StatusBadgeProps {
    status: StatusType;
    className?: string;
    showIcon?: boolean;
}

export const StatusBadge = ({ status, className, showIcon = true }: StatusBadgeProps) => {
    const getStatusConfig = (s: string) => {
        switch (s.toLowerCase()) {
            case 'pending':
                return { color: 'text-yellow-600 bg-yellow-50', icon: Clock };
            case 'accepted':
            case 'active':
                return { color: 'text-blue-600 bg-blue-50', icon: Clock }; // Or a generic active icon
            case 'completed':
            case 'verified':
                return { color: 'text-green-600 bg-green-50', icon: CheckCircle };
            case 'cancelled':
            case 'rejected':
                return { color: 'text-gray-600 bg-gray-50', icon: XCircle };
            case 'expired':
                return { color: 'text-orange-600 bg-orange-50', icon: AlertOctagon };
            case 'critical':
                return { color: 'text-red-600 bg-red-50', icon: AlertCircle };
            default:
                return { color: 'text-gray-600 bg-gray-50', icon: null };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <span className={clsx(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize",
            config.color,
            className
        )}>
            {showIcon && Icon && <Icon className="w-3.5 h-3.5" />}
            {status}
        </span>
    );
};
