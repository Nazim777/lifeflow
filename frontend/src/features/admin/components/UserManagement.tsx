import { useEffect, useState } from 'react';
import { AdminAPI } from '../api/admin';
import type { User } from '../../../types';
import { Search, Shield, ShieldOff, Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await AdminAPI.getAllUsers();
            setUsers(data);
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleBlock = async (user: User) => {
        if (user.role === 'admin') return;
        try {
            if (user.isBlocked) {
                await AdminAPI.unblockUser(user._id);
                toast.success('User unblocked');
            } else {
                await AdminAPI.blockUser(user._id);
                toast.success('User blocked');
            }
            fetchUsers();
        } catch (error) {
            toast.error("Failed to update user status");
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.name?.toLowerCase() || '').includes(filter.toLowerCase()) ||
            u.email.toLowerCase().includes(filter.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-500">Manage donors, hospitals, and recipients.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="p-2 border border-gray-200 rounded-xl outline-none"
                >
                    <option value="all">All Roles</option>
                    <option value="donor">Donors</option>
                    <option value="hospital">Hospitals</option>
                    <option value="recipient">Recipients</option>
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">User</th>
                                <th className="p-4 font-semibold text-gray-600">Role</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map(user => (
                                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">{user.name || 'Unnamed'}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 capitalize">
                                        <span className={clsx(
                                            "px-2 py-1 rounded-full text-xs font-medium",
                                            user.role === 'hospital' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'donor' ? 'bg-blue-100 text-blue-700' :
                                                    user.role === 'admin' ? 'bg-gray-100 text-gray-700' :
                                                        'bg-orange-100 text-orange-700'
                                        )}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={clsx(
                                            "flex items-center gap-1 text-xs font-medium",
                                            user.isBlocked ? 'text-red-600' : 'text-green-600'
                                        )}>
                                            {user.isBlocked ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => toggleBlock(user)}
                                                className={clsx(
                                                    "p-2 rounded-lg transition-colors",
                                                    user.isBlocked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                )}
                                                title={user.isBlocked ? "Unblock User" : "Block User"}
                                            >
                                                {user.isBlocked ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
