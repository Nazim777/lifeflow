import api from './axios';

export interface Appointment {
    _id: string;
    donorId: {
        _id: string;
        name: string;
        email: string;
        bloodGroup?: string;
        phone?: string;
    } | string;
    hospitalId: {
        _id: string;
        name: string;
        institutionName?: string;
        location?: {
            city: string;
            area: string;
        };
        phone?: string;
    } | string;
    date: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
    notes?: string;
    createdAt: string;
}

export const AppointmentsAPI = {
    create: async (data: { hospitalId: string; date: string; notes?: string }) => {
        const response = await api.post<Appointment>('/appointments', data);
        return response.data;
    },

    getAll: async () => {
        const response = await api.get<Appointment[]>('/appointments');
        return response.data;
    },

    updateStatus: async (id: string, status: string) => {
        const response = await api.patch<Appointment>(`/appointments/${id}/status`, { status });
        return response.data;
    }
};
