import api from '../../../api/axios';
import type { BloodRequest } from '../../../types';

export const RequestsAPI = {
    getAll: async (params?: any) => {
        const res = await api.get<BloodRequest[]>('/requests', { params });
        return res.data;
    },
    getOne: async (id: string) => {
        const res = await api.get<BloodRequest>(`/requests/${id}`);
        return res.data;
    },
    create: async (data: Partial<BloodRequest>) => {
        const res = await api.post<BloodRequest>('/requests', data);
        return res.data;
    },
    update: async (id: string, data: Partial<BloodRequest>) => {
        const res = await api.patch<BloodRequest>(`/requests/${id}`, data);
        return res.data;
    },
    updateStatus: async (id: string, status: string, assignedDonorId?: string) => {
        const payload: any = { status };
        if (assignedDonorId) {
            payload.assignedDonorId = assignedDonorId;
        }
        const res = await api.patch<BloodRequest>(`/requests/${id}`, payload);
        return res.data;
    },
    accept: async (id: string) => {
        const res = await api.patch<BloodRequest>(`/requests/${id}/accept`);
        return res.data;
    },
    complete: async (id: string) => {
        const res = await api.patch<BloodRequest>(`/requests/${id}/complete`);
        return res.data;
    },
    assignDonor: async (id: string, donorId: string) => {
        const res = await api.patch<BloodRequest>(`/requests/${id}/assign-donor`, { donorId });
        return res.data;
    }
};
