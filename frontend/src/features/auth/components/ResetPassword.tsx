import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../api/axios';
import { Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const schema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
    token: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // Assuming URL is /reset-password?token=XYZ
    // Or if we want users to manually input token:
    // const [token, setToken] = useState(''); 

    // Let's support both: if token in URL, use it, otherwise show input field for token?
    // Implementation Plan said "Form to set new password", logic in backend requires token.
    // I will add a Token input field if it's missing from URL.

    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: any) => {
        try {
            setIsLoading(true);
            setError('');
            await api.post('/auth/reset-password', {
                token: token || data.token, // Use URL token or form token
                password: data.password
            });
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
                    <p className="text-gray-500 mb-8">
                        Your password has been updated. You can now login with your new password.
                    </p>
                    <Link to="/login" className="w-full inline-block bg-red-500 text-white font-semibold py-3 rounded-xl hover:bg-red-600 transition-colors">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                    <p className="text-gray-500 mt-2">Create a new secure password.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    {!token && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Reset Token</label>
                            <input
                                {...register('token', { required: "Token is required" })}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder="Paste your token here"
                            />
                            {errors.token && <p className="text-red-500 text-xs">{errors.token.message as string}</p>}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                {...register('password')}
                                type="password"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-xs">{errors.password.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message as string}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-red-500 text-white font-semibold py-3 rounded-xl hover:bg-red-600 transition-colors shadow-lg hover:shadow-red-500/30"
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>

                    <div className="text-center">
                        <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
