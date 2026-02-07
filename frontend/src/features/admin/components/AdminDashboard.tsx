import { useEffect, useState } from 'react';
import { AdminAPI } from '../api/admin';
import { Users, Building2, UserCheck, AlertCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { StatsCard } from '../../../components/common/StatsCard';
import { DashboardHeader } from '../../../components/common/DashboardHeader';

export const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await AdminAPI.getStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-500' },
        { label: 'Active Donors', value: stats?.activeDonors || 0, icon: UserCheck, color: 'bg-green-500' },
        { label: 'Pending Hospitals', value: stats?.pendingHospitals || 0, icon: Building2, color: 'bg-purple-500' },
        { label: 'Pending Donors', value: stats?.pendingDonors || 0, icon: AlertCircle, color: 'bg-orange-500' },
    ];

    if (loading) return <div className="p-8">Loading stats...</div>;

    return (
        <div className="space-y-6">
            <DashboardHeader
                title="Admin Overview"
                subtitle="System performance and pending tasks."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <StatsCard
                        key={i}
                        label={card.label}
                        value={card.value}
                        icon={card.icon}
                        color={card.color}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-4">Management Quick Links</h3>
                    <div className="space-y-2">
                        <NavLink to="/admin/users" className="block p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="font-semibold">Manage Users</div>
                            <div className="text-sm text-gray-500">View, block, or delete users</div>
                        </NavLink>
                        <NavLink to="/admin/verification" className="block p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="font-semibold flex items-center justify-between">
                                Accounts Verification
                                {stats?.pendingHospitals > 0 && <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">{stats.pendingHospitals} Pending</span>}
                            </div>
                            <div className="text-sm text-gray-500">Approve or reject accounts registrations</div>
                        </NavLink>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
