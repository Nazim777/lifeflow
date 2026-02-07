import React from 'react';
import Sidebar from './Sidebar';
import { useAuthStore } from '../features/auth/hooks/useAuthStore';
import NotificationBell from './NotificationBell';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuthStore();

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome back, {user?.name || 'User'} 👋
                        </h1>
                        <p className="text-gray-500">Here's what's happening today.</p>
                    </div>
                    <NotificationBell />
                </header>
                {children}
            </main>
            <Toaster position="top-right" />
        </div>
    );
};

export default Layout;
