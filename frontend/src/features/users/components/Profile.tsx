import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../../api/axios';
import { useAuthStore } from '../../auth/hooks/useAuthStore';
import { Save, User, Building2 } from 'lucide-react';

// Schemas
const locationSchema = z.object({
    city: z.string().min(2, 'City is required'),
    area: z.string().min(2, 'Area is required'),
});

const donorSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    age: z.coerce.number().min(18, 'Must be at least 18'),
    gender: z.enum(['male', 'female', 'other']),
    weight: z.coerce.number().min(45, 'Weight must be at least 45kg'),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    location: locationSchema,
    availability: z.boolean(),
});

const recipientSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    location: locationSchema,
});

const hospitalSchema = z.object({
    institutionName: z.string().min(2, 'Institution Name is required'),
    location: locationSchema,
    licenseNumber: z.string().min(5, 'License Number is required'),
    contactNumber: z.string().min(10, 'Contact Number is required'),
});

const Profile = () => {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [existingBloodGroup, setExistingBloodGroup] = useState<string | null>(null);

    const activeSchema = user?.role === 'hospital' ? hospitalSchema : (user?.role === 'recipient' ? recipientSchema : donorSchema);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<any>({
        resolver: zodResolver(activeSchema),
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profiles/me');
                if (res.data) {
                    // Universal fields based on backend response structure
                    // Donor/Recipient have 'name', Hospital has 'institutionName'
                    Object.keys(res.data).forEach(key => {
                        // Careful with nested objects like location, react-hook-form handles dot notation in setValue but we need to pass strict values
                        if (key === 'location' && res.data.location) {
                            setValue('location.city', res.data.location.city);
                            setValue('location.area', res.data.location.area);
                        } else {
                            setValue(key, res.data[key]);
                        }
                        if (key === 'bloodGroup' && res.data[key]) {
                            setExistingBloodGroup(res.data[key]);
                        }
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
            }
        };
        fetchProfile();
    }, [setValue]);

    const onSubmit = async (data: any) => {
        try {
            setIsLoading(true);
            await api.patch('/profiles/me', data);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Failed to update profile', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-primary">
                        {user?.role === 'hospital' ? <Building2 className="w-8 h-8" /> : <User className="w-8 h-8" />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                        <p className="text-gray-500 capitalize">Manage your {user?.role} information</p>
                    </div>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Common / Donor / Recipient Fields */}
                    {(user?.role === 'donor' || user?.role === 'recipient') && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                {...register('name')}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                            {errors.name && <p className="text-red-500 text-xs">{errors.name?.message as string}</p>}
                        </div>
                    )}

                    {/* Hospital Fields */}
                    {user?.role === 'hospital' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Institution Name</label>
                            <input
                                {...register('institutionName')}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                            {errors.institutionName && <p className="text-red-500 text-xs">{errors.institutionName?.message as string}</p>}
                        </div>
                    )}

                    {/* Donor Specifics */}
                    {user?.role === 'donor' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Age</label>
                                <input
                                    {...register('age')}
                                    type="number"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                                {errors.age && <p className="text-red-500 text-xs">{errors.age?.message as string}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Gender</label>
                                <select
                                    {...register('gender')}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.gender && <p className="text-red-500 text-xs">{errors.gender?.message as string}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Blood Group</label>
                                <select
                                    {...register('bloodGroup')}
                                    disabled={!!existingBloodGroup}
                                    className={`w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white ${!!existingBloodGroup ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                                {errors.bloodGroup && <p className="text-red-500 text-xs">{errors.bloodGroup?.message as string}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
                                <input
                                    {...register('weight')}
                                    type="number"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                                {errors.weight && <p className="text-red-500 text-xs">{errors.weight?.message as string}</p>}
                            </div>
                        </div>
                    )}

                    {/* Hospital Specifics */}
                    {user?.role === 'hospital' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">License Number</label>
                                <input
                                    {...register('licenseNumber')}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                                {errors.licenseNumber && <p className="text-red-500 text-xs">{errors.licenseNumber?.message as string}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Contact Number</label>
                                <input
                                    {...register('contactNumber')}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                                {errors.contactNumber && <p className="text-red-500 text-xs">{errors.contactNumber?.message as string}</p>}
                            </div>
                        </div>
                    )}


                    {/* Location (Common) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">City</label>
                            <input
                                {...register('location.city')}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                            {(errors.location as any)?.city && <p className="text-red-500 text-xs">{(errors.location as any).city.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Area</label>
                            <input
                                {...register('location.area')}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                            {(errors.location as any)?.area && <p className="text-red-500 text-xs">{(errors.location as any).area.message as string}</p>}
                        </div>
                    </div>

                    {/* Donor Availability */}
                    {user?.role === 'donor' && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <input type="checkbox" {...register('availability')} className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" />
                            <label className="text-sm font-medium text-gray-700">Available for donation</label>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {isLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
