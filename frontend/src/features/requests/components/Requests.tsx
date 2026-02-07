import { useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/hooks/useAuthStore';
import { Plus, MapPin, Search, CheckCircle, Droplet } from 'lucide-react';
import { format } from 'date-fns';
import { RequestsAPI } from '../api/requests';
import type { BloodRequest } from '../../../types';
import toast from 'react-hot-toast';
import { CreateRequestModal } from './CreateRequestModal';

const Requests = () => {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filter, setFilter] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'my-requests' | 'my-commitments'>('all');
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await RequestsAPI.getAll();
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch requests', error);
            toast.error("Failed to load requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            if (status === 'accepted' && user?.role === 'donor') {
                await RequestsAPI.accept(id);
            } else {
                const assignedDonorId = status === 'accepted' ? user?._id : undefined;
                await RequestsAPI.updateStatus(id, status, assignedDonorId);
            }
            toast.success(`Request ${status} successfully`);
            fetchRequests(); // Refetch to ensure data consistency
        } catch (error: any) {
            console.error("Failed to update status", error);
            const message = error.response?.data?.message || "Failed to update request status.";
            toast.error(message);
        }
    };

    const getFilteredRequests = () => {
        let filtered = requests;

        // 1. Tab Filtering
        if (activeTab === 'my-requests' && user) {
            filtered = filtered.filter(req => {
                const reqIds = typeof req.requesterId === 'string' ? req.requesterId : req.requesterId._id;
                return reqIds === user._id;
            });
        } else if (activeTab === 'my-commitments' && user) {
            filtered = filtered.filter(req => {
                const donorId = typeof req.assignedDonorId === 'string' ? req.assignedDonorId : req.assignedDonorId?._id;
                return donorId === user._id;
            });
        } else {
            // 'all' tab - ideally hide completed/cancelled unless searching?
            // For now show pending/accepted. logic: 
            // If I am a donor, I want to see pending requests I can pick up.
            // If I am a recipient, I might want to see history.
            // keeping it simple: show all non-archived or just all for now.
            filtered = filtered.filter(req => req.status !== 'cancelled');
        }

        // 2. Search Filtering
        if (filter) {
            const lowerFilter = filter.toLowerCase();
            filtered = filtered.filter(req =>
                req.location.city.toLowerCase().includes(lowerFilter) ||
                req.bloodGroup.toLowerCase().includes(lowerFilter) ||
                req.patientName.toLowerCase().includes(lowerFilter)
            );
        }

        return filtered;
    };

    const filteredRequests = getFilteredRequests();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Blood Requests</h2>
                    <p className="text-gray-500">Find opportunities to save lives</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search city, blood group..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    {(user?.role === 'recipient' || user?.role === 'hospital' || user?.role === 'admin') && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors shadow-sm font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            New Request
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-100 pb-1 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-xl transition-colors whitespace-nowrap ${activeTab === 'all' ? 'text-red-500 border-b-2 border-red-500 bg-red-50/50' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    All Requests
                </button>
                {(user?.role === 'recipient' || user?.role === 'hospital') && (
                    <button
                        onClick={() => setActiveTab('my-requests')}
                        className={`px-4 py-2 text-sm font-medium rounded-t-xl transition-colors whitespace-nowrap ${activeTab === 'my-requests' ? 'text-red-500 border-b-2 border-red-500 bg-red-50/50' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        My Requests
                    </button>
                )}
                {user?.role === 'donor' && (
                    <button
                        onClick={() => setActiveTab('my-commitments')}
                        className={`px-4 py-2 text-sm font-medium rounded-t-xl transition-colors whitespace-nowrap ${activeTab === 'my-commitments' ? 'text-red-500 border-b-2 border-red-500 bg-red-50/50' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        My Commitments
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading requests...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map((req) => (
                        <RequestCard
                            key={req._id}
                            request={req}
                            user={user}
                            onStatusUpdate={handleStatusUpdate}
                        />
                    ))}

                    {filteredRequests.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            No requests found matching your criteria.
                        </div>
                    )}
                </div>
            )}

            {showCreateModal && <CreateRequestModal onClose={() => setShowCreateModal(false)} onSuccess={fetchRequests} />}
        </div>
    );
};

const RequestCard = ({ request: req, user, onStatusUpdate }: { request: BloodRequest, user: any, onStatusUpdate: (id: string, status: string) => void }) => {

    // Safely access properties that might be populated or raw IDs
    const requesterName = typeof req.requesterId === 'object' ? req.requesterId.name : 'Unknown';
    // const requesterEmail = typeof req.requesterId === 'object' ? req.requesterId.email : ''; // Unused, keeping commented or removing? Removing as per lint fix.
    const assignedDonorId = typeof req.assignedDonorId === 'object' ? req.assignedDonorId._id : req.assignedDonorId;
    const isOwner = user && (typeof req.requesterId === 'string' ? req.requesterId === user._id : req.requesterId?._id === user._id);
    const isAssignedDonor = user && assignedDonorId === user._id;

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            {req.urgency === 'critical' && (
                <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-bl-xl">
                    CRITICAL
                </div>
            )}

            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-primary font-bold text-xl">
                    {req.bloodGroup}
                </div>
                <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        req.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                            req.status === 'completed' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-600'
                        }`}>
                        {req.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(req.requiredDate), 'MMM d, yyyy')}
                    </p>
                </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-1">{req.patientName}</h3>
            <p className="text-sm text-gray-500 mb-4">
                by {requesterName}
            </p>

            <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-gray-400" />
                    <span>{req.units} Units Required</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{req.location.city}, {req.location.area}</span>
                </div>
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t border-gray-50">
                {/* Donor Action: Accept Request */}
                {user?.role === 'donor' && req.status === 'pending' && (
                    <button
                        onClick={() => onStatusUpdate(req._id, 'accepted')}
                        className="flex-1 bg-red-500 text-white font-medium py-2 rounded-xl hover:bg-red-600 transition-all text-sm"
                    >
                        Donate Now
                    </button>
                )}

                {/* Donor Action: Cancel Commitment */}
                {user?.role === 'donor' && req.status === 'accepted' && isAssignedDonor && (
                    <button
                        onClick={() => onStatusUpdate(req._id, 'pending')}
                        className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 rounded-xl hover:bg-gray-200 transition-all text-sm"
                    >
                        Cancel Donation
                    </button>
                )}

                {/* Requester Action: Mark Completed */}
                {isOwner && req.status === 'accepted' && (
                    <button
                        onClick={() => onStatusUpdate(req._id, 'completed')}
                        className="flex-1 bg-green-500 text-white font-medium py-2 rounded-xl hover:bg-green-600 transition-all text-sm flex items-center justify-center gap-1"
                    >
                        <CheckCircle className="w-4 h-4" /> Complete
                    </button>
                )}

                {/* Requester Action: Cancel Request */}
                {isOwner && req.status === 'pending' && (
                    <button
                        onClick={() => onStatusUpdate(req._id, 'cancelled')}
                        className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 rounded-xl hover:bg-gray-200 transition-all text-sm"
                    >
                        Cancel
                    </button>
                )}

                {/* Fallback View Details */}
                {req.status === 'completed' && (
                    <button disabled className="flex-1 bg-gray-50 text-gray-400 font-medium py-2 rounded-xl cursor-not-allowed text-sm">
                        Completed
                    </button>
                )}

                {req.status === 'cancelled' && (
                    <button disabled className="flex-1 bg-gray-50 text-gray-400 font-medium py-2 rounded-xl cursor-not-allowed text-sm">
                        Cancelled
                    </button>
                )}
            </div>
        </div>
    );
};


export default Requests;
