import { useEffect, useState } from 'react';
import { AdminAPI } from '../api/admin';
import type { User } from '../../../types';
import { Check, X, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const HospitalVerification = () => {
    const [hospitals, setHospitals] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingHospitals = async () => {
        setLoading(true);
        try {
            // Need to support filtering by isVerified=false and role=hospital
            // Implementing simplified filtering on client side if API returns mixed, 
            // but effectively we should use query params.
            // Using the general getAllUsers and filtering locally for now or passing params if supported.
            const data = await AdminAPI.getAllUsers({ role: 'hospital', isVerified: false });
            setHospitals(data);
        } catch (error) {
            toast.error("Failed to load pending hospitals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingHospitals();
    }, []);

    const handleVerify = async (id: string) => {
        try {
            await AdminAPI.verifyHospital(id);
            toast.success("Hospital verified successfully");
            fetchPendingHospitals();
        } catch (error) {
            toast.error("Failed to verify hospital");
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Are you sure you want to reject (block) this hospital?")) return;
        try {
            // Rejection usually means blocking or ignoring. Let's block implies 'rejected'.
            await AdminAPI.blockUser(id);
            toast.success("Hospital application rejected");
            fetchPendingHospitals();
        } catch (error) {
            toast.error("Failed to reject application");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Verification</h2>
                <p className="text-gray-500">Review and approve  accounts.</p>
            </div>

            {hospitals.length === 0 && !loading && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No pending hospital verifications</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hospitals.map(hospital => (
                    <div key={hospital._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
                                Pending
                            </span>
                        </div>

                        <h3 className="font-bold text-lg mb-1">{hospital.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{hospital.email}</p>

                        {hospital.hospitalProfile && (
                            <div className="text-sm text-gray-600 space-y-1 mb-6 bg-gray-50 p-3 rounded-lg">
                                <p><span className="font-semibold">City:</span> {hospital.hospitalProfile.institutionName}</p>
                                <p><span className="font-semibold">Contact:</span> {hospital.hospitalProfile.contactNumber}</p>
                                {/* Add more details if available in profile */}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleVerify(hospital._id)}
                                className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" /> Approve
                            </button>
                            <button
                                onClick={() => handleReject(hospital._id)}
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

export default HospitalVerification;
