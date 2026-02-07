import api from '../../../api/axios';
import type { Hospital } from '../../../types';

export const UsersAPI = {
    getHospitals: async (params?: any) => {
        const res = await api.get<Hospital[]>('/users/hospitals', { params });
        return res.data;
    },
    searchDonors: async (params?: any) => {
        const res = await api.get<any[]>('/users/donors', { params });
        return res.data;
    }
};
