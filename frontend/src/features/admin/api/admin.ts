import api from '../../../api/axios';
import type { User } from '../../../types';

export const AdminAPI = {
    getStats: async () => {
        const response = await api.get('/users/stats');
        return response.data;
    },

    getAllUsers: async (filters: any = {}) => {
        const response = await api.get<User[]>('/users', { params: filters });
        return response.data;
    },

    verifyUser: async (id: string) => {
        const response = await api.patch<User>(`/users/${id}/verify`);
        return response.data;
    },

    verifyHospital: async (id: string) => {
        const response = await api.patch<User>(`/users/${id}/verify-hospital`);
        return response.data;
    },

    unverifyUser: async (id: string) => {
        const response = await api.patch<User>(`/users/${id}/unverify`);
        return response.data;
    },

    blockUser: async (id: string) => {
        const response = await api.patch<User>(`/users/${id}/block`);
        return response.data;
    },

    unblockUser: async (id: string) => {
        const response = await api.patch<User>(`/users/${id}/unblock`);
        return response.data;
    },

    deleteUser: async (id: string) => {
        const response = await api.delete<User>(`/users/${id}`);
        return response.data;
    }
};
