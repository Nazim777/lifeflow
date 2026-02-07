
import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import { User, CheckCircle, XCircle, Shield } from 'lucide-react';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { DashboardHeader } from '../../../components/common/DashboardHeader';
import { StatsCard } from '../../../components/common/StatsCard';

interface UserData {
    _id: string;
    email: string;
    name: string;
    role: string;
    isVerified: boolean;
}

const Admin = () => {
    const [users, setUsers] = useState<UserData[]>([]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    const [stats, setStats] = useState({ totalDonors: 0, totalHospitals: 0, activeDonors: 0 });

    const fetchStats = async () => {
        try {
            const res = await api.get('/users/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, []);

    const handleVerify = async (id: string) => {
        try {
            await api.patch(`/users/${id}/verify`);
            setUsers(users.map(u => u._id === id ? { ...u, isVerified: true } : u));
        } catch (error) {
            console.error("Failed to verify user", error);
        }
    };

    const handleBlock = async (id: string) => { // Using as Delete for now or Block if implemented
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    return (
        <div className="space-y-6">
            <DashboardHeader
                title="Admin Console"
                subtitle="System management and verification"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    label="Donors"
                    value={stats.totalDonors}
                    icon={User}
                    color="bg-blue-100 text-blue-600"
                />
                <StatsCard
                    label="Hospitals"
                    value={stats.totalHospitals}
                    icon={Shield}
                    color="bg-purple-100 text-purple-600"
                />
                <StatsCard
                    label="Active Donors"
                    value={stats.activeDonors}
                    icon={CheckCircle}
                    color="bg-green-100 text-green-600"
                />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 font-semibold text-gray-700">User Management</div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 text-gray-500 text-sm">User</th>
                            <th className="p-4 text-gray-500 text-sm">Role</th>
                            <th className="p-4 text-gray-500 text-sm">Status</th>
                            <th className="p-4 text-gray-500 text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="font-medium text-gray-900">{user.name || 'No Name'}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </td>
                                <td className="p-4 capitalize text-gray-600">{user.role}</td>
                                <td className="p-4">
                                    <StatusBadge status={user.isVerified ? 'verified' : 'pending'} />
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    {!user.isVerified && (
                                        <button
                                            onClick={() => handleVerify(user._id)}
                                            className="text-green-500 hover:bg-green-50 p-2 rounded-lg"
                                            title="Verify User"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleBlock(user._id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                        title="Delete User"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Admin;
