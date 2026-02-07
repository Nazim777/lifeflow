import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Heart, Calendar, ArrowRight, MapPin, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { RequestsAPI } from '../../requests/api/requests';
import { AppointmentsAPI } from '../../../api/appointments';
import type { Appointment } from '../../../api/appointments';
import api from '../../../api/axios';
import type { BloodRequest } from '../../../types';
import { useAuthStore } from '../../auth/hooks/useAuthStore';
import { format } from 'date-fns';
import { StatsCard } from '../../../components/common/StatsCard';
import { DashboardHeader } from '../../../components/common/DashboardHeader';
import { EmptyState } from '../../../components/common/EmptyState';

const DonorDashboard = () => {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [eligibility, setEligibility] = useState<{ isEligible: boolean, nextEligibleDate: string | null } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [requestsData, profileRes, appointmentsData] = await Promise.all([
                    RequestsAPI.getAll(),
                    api.get('/profiles/me'),
                    AppointmentsAPI.getAll()
                ]);
                setRequests(requestsData);
                setAppointments(appointmentsData);
                if (profileRes.data) {
                    setEligibility({
                        isEligible: profileRes.data.isEligible,
                        nextEligibleDate: profileRes.data.nextEligibleDate
                    });
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Derived stats
    const totalDonations = requests.filter(r => r.assignedDonorId === user?._id && r.status === 'completed').length;
    // Assuming 3 lives saved per donation is a common metric, or we track it in backend. For now, simple multiplier.
    const livesSaved = totalDonations * 3;

    // Find last donation date
    const myCompleted = requests.filter(r => r.assignedDonorId === user?._id && r.status === 'completed');
    const lastDonation = myCompleted.length > 0
        ? format(new Date(Math.max(...myCompleted.map(r => new Date(r.requiredDate).getTime()))), 'MMM d, yyyy')
        : 'Never';

    // Filter for urgent/pending requests to show
    const urgentRequests = requests
        .filter(r => r.status === 'pending')
        .sort((a, b) => {
            if (a.urgency === 'critical' && b.urgency !== 'critical') return -1;
            if (a.urgency !== 'critical' && b.urgency === 'critical') return 1;
            return new Date(a.requiredDate).getTime() - new Date(b.requiredDate).getTime();
        })
        .slice(0, 3); // Top 3

    return (
        <div className="space-y-6">
            <DashboardHeader
                title={`Welcome back, ${user?.name}`}
            />

            {/* Eligibility Banner */}
            {eligibility && !eligibility.isEligible && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-amber-800">You are currently ineligible to donate</h3>
                        <p className="text-amber-700 text-sm">
                            Thank you for your recent donation! You will be eligible again on <span className="font-bold">{format(new Date(eligibility.nextEligibleDate!), 'MMMM d, yyyy')}</span>.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    label="Total Donations"
                    value={totalDonations}
                    icon={Droplets}
                    color="bg-red-100 text-red-600"
                />
                <StatsCard
                    label="Lives Saved"
                    value={livesSaved}
                    icon={Heart}
                    color="bg-green-100 text-green-600"
                />
                <StatsCard
                    label="Last Donation"
                    value={lastDonation}
                    icon={Calendar}
                    color="bg-blue-100 text-blue-600"
                />
            </div>

            {/* Upcoming Appointments */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Appointments</h2>
                {appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length > 0 ? (
                    <div className="space-y-4">
                        {appointments
                            .filter(a => a.status === 'pending' || a.status === 'confirmed')
                            .map(appointment => (
                                <div key={appointment._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">
                                                {typeof appointment.hospitalId === 'object' ? (appointment.hospitalId as any).name : 'Hospital'}
                                            </h3>
                                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {format(new Date(appointment.date), 'MMMM d, yyyy h:mm a')}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize w-fit ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {appointment.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Are you sure you want to cancel this appointment?')) {
                                                try {
                                                    await AppointmentsAPI.updateStatus(appointment._id, 'cancelled');
                                                    setAppointments(prev => prev.map(a => a._id === appointment._id ? { ...a, status: 'cancelled' } : a));
                                                    toast.success('Appointment cancelled');
                                                } catch (err) {
                                                    toast.error('Failed to cancel appointment');
                                                }
                                            }
                                        }}
                                        className="text-red-500 hover:text-red-700 font-medium text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No upcoming appointments"
                        description="Schedule a donation at a nearby center."
                        action={
                            <Link to="/donate" className="mt-4 inline-block bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition-colors">
                                Find Centers
                            </Link>
                        }
                    />
                )}
            </div>

            {/* Urgent Requests Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Urgent Blood Requests</h2>
                    <Link to="/requests" className="text-red-500 font-medium hover:text-red-700 flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading requests...</div>
                ) : urgentRequests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {urgentRequests.map(req => (
                            <div key={req._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                {req.urgency === 'critical' && (
                                    <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> CRITICAL
                                    </div>
                                )}

                                <div className="mb-4">
                                    <h3 className="font-bold text-lg text-gray-900">{req.patientName}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <MapPin className="w-4 h-4" />
                                        {req.location.city}, {req.location.area}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 font-bold">
                                            {req.bloodGroup}
                                        </span>
                                        <span className="text-sm text-gray-600">{req.units} Units</span>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                        Required by<br />
                                        <span className="font-medium text-gray-900">{format(new Date(req.requiredDate), 'MMM d')}</span>
                                    </div>
                                </div>

                                <Link
                                    to="/requests"
                                    className="block w-full text-center bg-red-500 text-white font-medium py-3 rounded-xl hover:bg-red-600 transition-colors"
                                >
                                    Donate Now
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No urgent requests"
                        description="There are no urgent blood requests at the moment."
                    />
                )}
            </div>
        </div>
    );
};

export default DonorDashboard;
