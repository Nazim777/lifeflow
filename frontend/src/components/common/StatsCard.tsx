import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color: string; // e.g., 'bg-blue-500' or 'text-blue-500' depending on usage, but here we expect bg class for icon wrapper
    iconColor?: string; // Optional override for icon text color if needed, defaults to white or inherited
    subtext?: string;
    onClick?: () => void;
}

export const StatsCard = ({ label, value, icon: Icon, color, subtext, onClick }: StatsCardProps) => {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md",
                onClick && "cursor-pointer"
            )}
        >
            <div className={clsx("p-3 rounded-xl text-white", color)}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
        </div>
    );
};
