import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    _id: string;
    email: string;
    role: string;
    name?: string;
    isVerified?: boolean;
    hospitalProfile?: any;
    donorProfile?: any;
    recipientProfile?: any;
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    setAuth: (user: User, token: string, refreshToken: string) => void;
    setUser: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            setAuth: (user, token, refreshToken) => set({ user, token, refreshToken }),
            setUser: (user) => set({ user }),
            logout: () => set({ user: null, token: null, refreshToken: null }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
