import { useEffect, useState } from 'react';
import { MapPin, Calendar, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { UsersAPI } from '../../users/api/users';
import type { Hospital } from '../../../types';
import toast from 'react-hot-toast';
import { ScheduleAppointmentModal } from '../../appointments/components/ScheduleAppointmentModal';

const Donate = () => {
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
    const [centers, setCenters] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                const data = await UsersAPI.getHospitals();
                setCenters(data);
            } catch (error) {
                console.error("Failed to fetch donation centers", error);
                toast.error("Failed to load donation centers.");
            } finally {
                setLoading(false);
            }
        };
        fetchCenters();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Donate Blood</h2>
                <p className="text-gray-500">Find a donation center near you and save lives.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {centers.map(center => (
                        <div key={center._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-red-50 text-primary rounded-xl">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">OPEN</span>
                            </div>

                            <h3 className="font-bold text-lg text-gray-900 mb-1">{center.institutionName || center.name}</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                {center.location?.city ? `${center.location.city}, ${center.location.area}` : 'Location n/a'}
                            </p>

                            <div className="space-y-3 text-sm text-gray-600 mb-6">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>Mon - Sat</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>9:00 AM - 5:00 PM</span>
                                </div>
                                {center.phone && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-400">P:</span>
                                        <span>{center.phone}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedHospital(center)}
                                className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2.5 rounded-xl font-medium hover:bg-red-600 transition-colors"
                            >
                                Schedule Appointment <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {centers.length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            No donation centers found.
                        </div>
                    )}
                </div>
            )}

            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl p-8 text-white text-center mt-8">
                <h3 className="text-2xl font-bold mb-2">Can't get to a center?</h3>
                <p className="text-red-100 mb-6 max-w-lg mx-auto">
                    Check out our mobile donation drives happening in your city this weekend.
                </p>
                <button className="bg-white text-red-500 px-6 py-2 rounded-full font-bold hover:bg-red-50 transition-colors">
                    Find Mobile Drives
                </button>
            </div>

            {selectedHospital && (
                <ScheduleAppointmentModal
                    hospitalId={selectedHospital._id}
                    hospitalName={selectedHospital.institutionName || selectedHospital.name}
                    onClose={() => setSelectedHospital(null)}
                    onSuccess={() => {
                        setSelectedHospital(null);
                        // Optional: Navigate to dashboard or show success message there? Toast handled in modal.
                    }}
                />
            )}
        </div>
    );
};

export default Donate;
