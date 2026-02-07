import axios from 'axios';
import { useAuthStore } from '../features/auth/hooks/useAuthStore';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Here we would call refresh endpoint. 
                // For now, let's just logout if failed or implement refresh logic later.
                // const { refreshToken } = useAuthStore.getState();
                // const res = await axios.post('http://localhost:3000/auth/refresh', { refreshToken });
                // useAuthStore.getState().setToken(res.data.access_token);
                // return api(originalRequest);
                useAuthStore.getState().logout(); // Temporary fallback
                window.location.href = '/login';
            } catch (refreshError) {
                useAuthStore.getState().logout();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
