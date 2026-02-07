import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { RequestsAPI } from '../api/requests';
import { UsersAPI } from '../../users/api/users';
import type { Hospital } from '../../../types';

export const CreateRequestModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm();
    const [hospitals, setHospitals] = useState<Hospital[]>([]);

    console.log('hospitals', hospitals)
    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const data = await UsersAPI.getHospitals();
                setHospitals(data);
            } catch (error) {
                console.error("Failed to fetch hospitals", error);
            }
        };
        fetchHospitals();
    }, []);

    const onSubmit = async (data: any) => {
        try {
            await RequestsAPI.create(data);
            toast.success("Request created successfully!");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Failed to create request", error);
            const message = error.response?.data?.message || "Failed to create request.";
            toast.error(message);
        }
    };

    const minDate = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Create Blood Request</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <XCircle className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Patient Name</label>
                            <input {...register('patientName')} placeholder="Full Name" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Blood Group</label>
                            <select {...register('bloodGroup')} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white transition-all" required>
                                <option value="">Select Group</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Units</label>
                            <input {...register('units')} type="number" min="1" placeholder="Ex: 2" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Required Date</label>
                            <input {...register('requiredDate')} type="date" min={minDate} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" required />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Hospital (Optional)</label>
                        <select {...register('hospitalId')} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white transition-all">
                            <option value="">Select a Hospital</option>
                            {hospitals.map(h => (
                                <option key={h._id} value={h._id}>
                                    {h.institutionName || h.name} - {h.location?.city}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">City</label>
                            <input {...register('location.city')} placeholder="City" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Area/Hospital</label>
                            <input {...register('location.area')} placeholder="Area" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" required />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Urgency Level</label>
                        <select {...register('urgency')} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white transition-all">
                            <option value="normal">Normal Urgency</option>
                            <option value="critical">Critical Urgency</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Expires At</label>
                        <input {...register('expiresAt')} type="date" min={minDate} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                        <p className="text-xs text-gray-400 mt-1">If blank, defaults to 24h after required date.</p>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200">
                            {isSubmitting ? 'Creating...' : 'Create Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
