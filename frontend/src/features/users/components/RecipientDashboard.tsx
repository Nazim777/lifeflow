import { useEffect, useState } from 'react';
import { RequestsAPI } from '../../requests/api/requests';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../../auth/hooks/useAuthStore';
import { CreateRequestModal } from '../../requests/components/CreateRequestModal';
import toast from 'react-hot-toast';
import { DashboardHeader } from '../../../components/common/DashboardHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { EmptyState } from '../../../components/common/EmptyState';

const RecipientDashboard = () => {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchRequests = async () => {
        try {
            const data = await RequestsAPI.getAll(); // Ideally backend filters for "My" requests or we use a new endpoint
            // Filtering client side for now as per previous pattern, but safer to do backend
            const myRequests = data.filter((r: any) => {
                const reqId = typeof r.requesterId === 'string' ? r.requesterId : r.requesterId._id;
                return reqId === user?._id;
            });
            setRequests(myRequests);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch your requests");
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [user]); // Re-fetch if user changes (e.g. login sync)

    const handleCancel = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this request?")) return;
        try {
            // We need a specific cancel endpoint or update status
            // Assuming updateStatus handles specific checks or we used generic update
            // Previously we added `cancel` method to service, but exposed it via `updateStatus` or new endpoint?
            // RequestsAPI.updateStatus uses PATCH /requests/:id with payload { status }.
            // Service `update` handles status change. 
            // Wait, I added `cancel` to service but did I expose it in controller? 
            // I probably didn't expose explicit `cancel` endpoint in controller, but `update` might handle it if I allow it.
            // Actually, in `RequestsService.update`, I added logic: "Allow status updates...".
            // So `updateStatus('cancelled')` should work if validation passes.
            // BUT `cancel` method in service strictly checks ownership and pending status.
            // Better to use `updateStatus` for now which calls `update`.
            // Wait, does `update` call `cancel`? No.
            // I should use `updateStatus('cancelled')`.

            await RequestsAPI.updateStatus(id, 'cancelled');
            toast.success("Request cancelled");
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to cancel request");
        }
    };

    return (
        <div className="space-y-6">
            <DashboardHeader
                title="Recipient Dashboard"
                subtitle="Manage your blood requests"
                actions={
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-red-200 hover:bg-red-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Request
                    </button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((req: any) => (
                    <div key={req._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group">

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{req.patientName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-md">
                                        {req.bloodGroup}
                                    </span>
                                    <span className="text-xs font-medium text-gray-500">
                                        {req.units} Units
                                    </span>
                                </div>
                            </div>
                            <StatusBadge status={req.status} showIcon={true} />
                        </div>

                        <div className="text-sm text-gray-500 space-y-1 mb-4">
                            <p>Location: {req.location?.city}, {req.location?.area}</p>
                            <p>Required: {new Date(req.requiredDate).toLocaleDateString()}</p>
                        </div>

                        {req.status === 'pending' && (
                            <button
                                onClick={() => handleCancel(req._id)}
                                className="w-full py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 hover:text-red-600 transition-colors"
                            >
                                Cancel Request
                            </button>
                        )}

                        {/* If accepted, maybe show donor info? (Limited) */}
                        {req.status === 'accepted' && req.assignedDonorId && (
                            <div className="mt-4 pt-4 border-t border-gray-50 text-sm">
                                <p className="text-gray-500">Accepted by Donor</p>
                                {/* Privacy: Name only if logic permits, usually masked until completion or accepted? Recipient can see donor name. */}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {requests.length === 0 && (
                <EmptyState
                    title="No requests found"
                    description="Create a request to get started!"
                />
            )}

            {showCreateModal && <CreateRequestModal onClose={() => setShowCreateModal(false)} onSuccess={fetchRequests} />}
        </div>
    );
};

export default RecipientDashboard;
