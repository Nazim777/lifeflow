import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';
import api from '../../../api/axios';
import { Heart, Mail, Lock, User, Loader2, Building2 } from 'lucide-react';

const registerSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['donor', 'hospital', 'recipient']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'donor',
        },
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setIsLoading(true);
            setError('');
            await api.post('/auth/register', data);
            // navigate('/login'); // Removed direct redirect
            // Show success message or redirect to a specific "Verify Pending" page
            // For now, let's use the error state to show a success message (hacky but functional given constraints) or just alert
            alert('Registration successful! Please wait for Admin approval before logging in.');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                            <Heart className="w-8 h-8 text-primary fill-primary" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Join the Cause</h2>
                        <p className="text-gray-500 mt-2">Start your journey today</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <label
                                className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${selectedRole === 'donor'
                                    ? 'border-primary bg-red-50 text-primary'
                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    value="donor"
                                    {...register('role')}
                                    className="hidden"
                                />
                                <User className="w-6 h-6" />
                                <span className="text-sm font-medium">Donor</span>
                            </label>
                            <label
                                className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${selectedRole === 'hospital'
                                    ? 'border-primary bg-red-50 text-primary'
                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    value="hospital"
                                    {...register('role')}
                                    className="hidden"
                                />
                                <Building2 className="w-6 h-6" />
                                <span className="text-sm font-medium">Hospital</span>
                            </label>
                            <label
                                className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${selectedRole === 'recipient'
                                    ? 'border-primary bg-red-50 text-primary'
                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    value="recipient"
                                    {...register('role')}
                                    className="hidden"
                                />
                                <User className="w-6 h-6" />
                                <span className="text-sm font-medium">Recipient</span>
                            </label>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                {selectedRole === 'hospital' ? 'Institution Name' : 'Full Name'}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    {...register('name')}
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                                    placeholder={selectedRole === 'hospital' ? "City Hospital" : "John Doe"}
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    {...register('password')}
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-red-500/30 flex items-center justify-center"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
