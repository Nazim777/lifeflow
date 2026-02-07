import { useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/hooks/useAuthStore';
import { Droplet, CheckCircle, User, Calendar, AlertCircle } from 'lucide-react';
import { RequestsAPI } from '../api/requests';
import { UsersAPI } from '../../users/api/users';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const HospitalRequests = () => {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [donorModalOpen, setDonorModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            // Fetch requests assigned to this hospital
            const res = await RequestsAPI.getAll({ hospitalId: user?._id });
            setRequests(res);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [user]);

    const handleComplete = async (id: string) => {
        if (!confirm("Confirm request completion? This will deduct stock from inventory.")) return;
        try {
            await RequestsAPI.complete(id); // Need to add this method to API
            toast.success("Request completed and stock updated.");
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to complete request");
        }
    };

    const openAssignModal = (req: any) => {
        setSelectedRequest(req);
        setDonorModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Request Management</h2>
                    <p className="text-gray-500">Handle blood requests assigned to your hospital</p>
                </div>
                <button onClick={fetchRequests} className="text-primary text-sm font-medium hover:underline">Refresh</button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : (
                <div className="grid gap-4">
                    {requests.length === 0 ? (
                        <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200">
                            <p className="text-gray-500">No requests assigned to this hospital yet.</p>
                        </div>
                    ) : (
                        requests.map(req => (
                            <div key={req._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center text-primary font-bold text-2xl shrink-0">
                                    {req.bloodGroup}
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900 text-lg">{req.patientName}</h3>
                                        {req.urgency === 'critical' && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">CRITICAL</span>}
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            req.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>{req.status}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Droplet className="w-4 h-4" /> {req.units} Units</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Due: {format(new Date(req.requiredDate), 'MMM d')}</span>
                                        <span className="flex items-center gap-1"><User className="w-4 h-4" /> Posted by {req.requesterId?.name}</span>
                                    </div>
                                    {req.assignedDonorId && (
                                        <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-lg inline-flex items-center gap-2 mt-1">
                                            <CheckCircle className="w-3 h-3" /> Donor Assigned
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 w-full md:w-auto min-w-[140px]">
                                    {/* Actions */}
                                    {req.status === 'pending' && (
                                        <button
                                            onClick={() => openAssignModal(req)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors font-medium text-sm"
                                        >
                                            Assign Donor
                                        </button>
                                    )}
                                    {(req.status === 'pending' || req.status === 'accepted') && (
                                        <button
                                            onClick={() => handleComplete(req._id)}
                                            className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Mark Complete
                                        </button>
                                    )}
                                    {req.status === 'completed' && (
                                        <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded-xl font-medium text-sm cursor-not-allowed">
                                            Completed
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {donorModalOpen && selectedRequest && (
                <AssignDonorModal
                    request={selectedRequest}
                    onClose={() => { setDonorModalOpen(false); setSelectedRequest(null); }}
                    onSuccess={() => {
                        fetchRequests();
                        setDonorModalOpen(false);
                        setSelectedRequest(null);
                    }}
                />
            )}
        </div>
    );
};

const AssignDonorModal = ({ request, onClose, onSuccess }: { request: any, onClose: () => void, onSuccess: () => void }) => {
    const [donors, setDonors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchDonors = async () => {
            setLoading(true);
            try {
                // Fetch eligible donors
                // Filter by blood group automatically
                const res = await UsersAPI.searchDonors({ bloodGroup: request.bloodGroup, city: search });
                setDonors(res);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDonors();
    }, [request, search]);

    const handleAssign = async (donorId: string) => {
        try {
            await RequestsAPI.assignDonor(request._id, donorId);
            toast.success("Donor assigned successfully");
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to assign donor");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Assign Donor for {request.patientName}</h3>
                    <button onClick={onClose}><AlertCircle className="rotate-45 text-gray-400" /></button>
                </div>

                <div className="mb-4">
                    <input
                        placeholder="Search donors by city..."
                        className="w-full p-2 border rounded-xl"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    {loading ? <p className="text-center text-gray-400">Finding donors...</p> :
                        donors.length === 0 ? <p className="text-center text-gray-400">No matching donors found for {request.bloodGroup}.</p> :
                            donors.map(donor => (
                                <div key={donor._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="font-bold">{donor.name}</p>
                                        <p className="text-xs text-gray-500">{donor.location.city}, {donor.location.area}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (!donor.availability) {
                                                toast.error("Donor is unavailable. They might have donated recently.");
                                                return;
                                            }
                                            handleAssign(donor._id);
                                        }}
                                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${donor.availability
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-300'
                                            }`}
                                    >
                                        Assign
                                    </button>
                                </div>
                            ))
                    }
                </div>
            </div>
        </div>
    )
}

export default HospitalRequests;
