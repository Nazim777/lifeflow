import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Search, MapPin, Droplet, User, CheckCircle, XCircle } from 'lucide-react';
import { UsersAPI } from '../api/users';
import { CreateRequestModal } from '../../requests/components/CreateRequestModal';
import toast from 'react-hot-toast';

const DonorSearch = () => {
    const { register, handleSubmit } = useForm();
    const [donors, setDonors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const results = await UsersAPI.searchDonors(data);
            setDonors(results);
            setSearched(true);
        } catch (error) {
            console.error("Failed to search donors", error);
            toast.error("Failed to search donors");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Find Donors</h1>
                <p className="text-gray-500 mt-1">Search for eligible donors in your area</p>
            </header>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select {...register('bloodGroup')} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white transition-all">
                            <option value="">Any Blood Group</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                    </div>
                    <div className="flex-[2] relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input {...register('city')} placeholder="City or Area (e.g. Dhaka)" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                    </div>
                    <button type="submit" disabled={loading} className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2">
                        {loading ? 'Searching...' : <><Search className="w-5 h-5" /> Search</>}
                    </button>
                </form>
            </div>

            <div className="space-y-4">
                {searched && donors.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No available donors found matching your criteria.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {donors.map((donor) => (
                        <div key={donor._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{donor.name}</h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <MapPin className="w-3 h-3" />
                                            {donor.location?.city}, {donor.location?.area}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <span className="block text-xl font-black text-red-500">{donor.bloodGroup}</span>
                                    {donor.availability ? (
                                        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1">
                                            <CheckCircle className="w-3 h-3" /> Available
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full mt-1">
                                            <XCircle className="w-3 h-3" /> Busy
                                        </span>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (!donor.availability) {
                                        toast.error("Donor is unavailable. They might have donated recently.");
                                        return;
                                    }
                                    setShowCreateModal(true);
                                }}
                                className={`w-full py-2.5 mt-2 rounded-xl font-bold transition-all ${donor.availability
                                    ? 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-200'
                                    }`}
                            >
                                Request Donation
                            </button>
                            {/* Note: Ideally we pre-fill the modal with this donor/blood group but simplification for now */}
                        </div>
                    ))}
                </div>
            </div>

            {showCreateModal && <CreateRequestModal onClose={() => setShowCreateModal(false)} onSuccess={() => { }} />}
        </div>
    );
};

export default DonorSearch;
