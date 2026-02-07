import { useEffect, useState } from 'react';
import { AdminAPI } from '../api/admin';
import type { User } from '../../../types';
import { Check, X, Building2, User as UserIcon, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export const VerificationQueue = () => {
    const [activeTab, setActiveTab] = useState<'hospital' | 'donor' | 'recipient'>('hospital');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingUsers = async () => {
        setLoading(true);
        try {
            const data = await AdminAPI.getAllUsers({ role: activeTab, isVerified: false });
            setUsers(data);
        } catch (error) {
            toast.error(`Failed to load pending ${activeTab}s`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, [activeTab]);

    const handleVerify = async (id: string) => {
        try {
            // Using generic verifyUser which works for all roles (Hospital, Donor, Recipient)
            await AdminAPI.verifyUser(id);
            toast.success("User verified successfully");
            fetchPendingUsers();
        } catch (error) {
            toast.error("Failed to verify user");
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Are you sure you want to reject (block) this application?")) return;
        try {
            await AdminAPI.blockUser(id);
            toast.success("Application rejected");
            fetchPendingUsers();
        } catch (error) {
            toast.error("Failed to reject application");
        }
    };

    const tabs = [
        { id: 'hospital', label: 'Hospitals', icon: Building2 },
        { id: 'donor', label: 'Donors', icon: Heart },
        { id: 'recipient', label: 'Recipients', icon: UserIcon },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Verification Queue</h2>
                <p className="text-gray-500">Review and approve pending account registrations.</p>
            </div>

            <div className="flex gap-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                            activeTab === tab.id
                                ? "bg-red-500 text-white shadow-md shadow-red-200"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {users.length === 0 && !loading && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                        {activeTab === 'hospital' ? <Building2 /> : activeTab === 'donor' ? <Heart /> : <UserIcon />}
                    </div>
                    <p className="text-gray-500 capitalize">No pending {activeTab} verifications</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => (
                    <div key={user._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                            <div className={clsx(
                                "p-3 rounded-xl",
                                activeTab === 'hospital' ? "bg-purple-100 text-purple-600" :
                                    activeTab === 'donor' ? "bg-red-100 text-red-600" :
                                        "bg-blue-100 text-blue-600"
                            )}>
                                {activeTab === 'hospital' ? <Building2 className="w-6 h-6" /> :
                                    activeTab === 'donor' ? <Heart className="w-6 h-6" /> :
                                        <UserIcon className="w-6 h-6" />}
                            </div>
                            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
                                Pending
                            </span>
                        </div>

                        <h3 className="font-bold text-lg mb-1">{user.name || 'Unnamed User'}</h3>
                        <p className="text-sm text-gray-500 mb-4">{user.email}</p>

                        <div className="text-sm text-gray-600 space-y-1 mb-6 bg-gray-50 p-3 rounded-lg">
                            {activeTab === 'hospital' && user.hospitalProfile && (
                                <>
                                    <p><span className="font-semibold">Institution:</span> {user.hospitalProfile.institutionName}</p>
                                    <p><span className="font-semibold">Contact:</span> {user.hospitalProfile.contactNumber}</p>
                                </>
                            )}
                            {activeTab === 'donor' && (
                                <p><span className="font-semibold">Role:</span> Blood Donor</p>
                            )}
                            {activeTab === 'recipient' && (
                                <p><span className="font-semibold">Role:</span> Recipient</p>
                            )}
                            <p><span className="font-semibold">Registered:</span> {new Date().toLocaleDateString()}</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleVerify(user._id)}
                                className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" /> Approve
                            </button>
                            <button
                                onClick={() => handleReject(user._id)}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" /> Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VerificationQueue;
