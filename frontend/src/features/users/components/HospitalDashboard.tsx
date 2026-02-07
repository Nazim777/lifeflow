import { useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/hooks/useAuthStore';
import { Building2, Droplet, Activity, AlertTriangle, Calendar, Check, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';
import { DashboardHeader } from '../../../components/common/DashboardHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AppointmentsAPI } from '../../../api/appointments';
import type { Appointment } from '../../../api/appointments';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const HospitalDashboard = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({ inventoryCount: 0, pendingRequests: 0 });
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.isVerified) return;
            try {
                // Fetch basic stats
                const invRes = await api.get('/inventory/aggregated');
                const totalUnits = invRes.data.reduce((acc: number, item: any) => acc + item.totalUnits, 0);

                // Fetch appointments
                const appointmentsData = await AppointmentsAPI.getAll();
                setAppointments(appointmentsData);

                // Fetch pending requests
                // const reqRes = await api.get('/requests?status=pending'); // simplified
                // setStats({ inventoryCount: totalUnits, pendingRequests: reqRes.data.length });
                // Optimizing: Just set inventory for now
                setStats((prev: any) => ({ ...prev, inventoryCount: totalUnits }));
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, [user]);

    if (!user?.isVerified) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-yellow-50 rounded-3xl border border-yellow-100">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-10 h-10 text-yellow-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Verification Pending</h2>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                    Your hospital account is currently under review. access to inventory and request management will be enabled once an administrator verifies your profile.
                </p>
                <div className="bg-white p-4 rounded-xl shadow-sm text-sm text-gray-500">
                    License Number: <span className="font-mono text-gray-900 font-medium">{user?.hospitalProfile?.licenseNumber || 'Submitted'}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <DashboardHeader
                title="Hospital Dashboard"
                subtitle="Manage blood stock and donor requests"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between group hover:border-red-100 transition-colors">
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Total Blood Units</p>
                        <h3 className="text-3xl font-bold text-gray-900">{stats.inventoryCount}</h3>
                        <Link to="/inventory" className="text-red-500 text-sm font-semibold mt-2 inline-block hover:underline">Manage Inventory</Link>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                        <Droplet className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between group hover:border-blue-100 transition-colors">
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Verification Status</p>
                        <h3 className="text-3xl font-bold text-green-600 flex items-center gap-2">
                            <StatusBadge status="Verified" className="text-lg px-3 py-1.5" />
                        </h3>
                        <p className="text-sm text-gray-400 mt-2">Full access enabled</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <Building2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between group hover:border-orange-100 transition-colors">
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Profile</p>
                        <h3 className="text-xl font-bold text-gray-900 truncate max-w-[150px]">{user?.name}</h3>
                        <Link to="/profile" className="text-orange-500 text-sm font-semibold mt-auto inline-block hover:underline">Edit Profile</Link>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <Activity className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Appointment Requests */}
            <div>
                <h3 className="font-bold text-lg mb-4 text-gray-900">Appointment Requests</h3>
                {appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length > 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-sm">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Date & Time</th>
                                        <th className="px-6 py-4 font-medium">Donor</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Notes</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').map(appointment => (
                                        <tr key={appointment._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-900 font-medium">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {format(new Date(appointment.date), 'MMM d, yyyy')}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 pl-6">
                                                    <Clock className="w-3 h-3" />
                                                    {format(new Date(appointment.date), 'h:mm a')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {typeof appointment.donorId === 'object' ? (appointment.donorId as any).name : 'Donor'}
                                                    {(typeof appointment.donorId === 'object' && (appointment.donorId as any).bloodGroup) && (
                                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                            {(appointment.donorId as any).bloodGroup}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {typeof appointment.donorId === 'object' ? (appointment.donorId as any).phone : ''}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={appointment.status} showIcon={false} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {appointment.notes || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {appointment.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await AppointmentsAPI.updateStatus(appointment._id, 'confirmed');
                                                                        setAppointments(prev => prev.map(a => a._id === appointment._id ? { ...a, status: 'confirmed' } : a));
                                                                        toast.success('Appointment confirmed');
                                                                    } catch (err) {
                                                                        toast.error('Failed to confirm');
                                                                    }
                                                                }}
                                                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                                title="Accept"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm('Reject this appointment?')) {
                                                                        try {
                                                                            await AppointmentsAPI.updateStatus(appointment._id, 'rejected');

                                                                            // Actually let's just update status
                                                                            setAppointments(prev => prev.map(a => a._id === appointment._id ? { ...a, status: 'rejected' } : a));
                                                                            toast.success('Appointment rejected');
                                                                        } catch (err) {
                                                                            toast.error('Failed to reject');
                                                                        }
                                                                    }
                                                                }}
                                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                                title="Reject"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {appointment.status === 'confirmed' && (
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm('Mark as completed?')) {
                                                                    try {
                                                                        await AppointmentsAPI.updateStatus(appointment._id, 'completed');
                                                                        setAppointments(prev => prev.map(a => a._id === appointment._id ? { ...a, status: 'completed' } : a));
                                                                        toast.success('Appointment completed');
                                                                    } catch (err) {
                                                                        toast.error('Failed to complete');
                                                                    }
                                                                }
                                                            }}
                                                            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-500">
                        No pending appointment requests.
                    </div>
                )}
            </div>

            {/* Quick Actions / Recent Activity placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/inventory" className="p-4 bg-gray-50 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors text-center font-medium">Add Stock</Link>
                        <Link to="/requests" className="p-4 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors text-center font-medium">View Requests</Link>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default HospitalDashboard;
