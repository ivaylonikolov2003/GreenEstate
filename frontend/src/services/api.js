import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000';

// Създаване на axios инстанция
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Автоматично добавяне на JWT токен към всяка заявка
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Автоматично пренасочване към логин при изтекъл токен
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            const wasLoggedIn = localStorage.getItem('access_token');
            localStorage.clear();
            if (wasLoggedIn) {
                // Показваме съобщение за изтекла сесия
                sessionStorage.setItem('session_expired', '1');
            }
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const register = (data) => api.post('/register', data);
export const login = (data) => api.post('/login', data);
export const logout = () => api.post('/logout');
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);
export const getStats = () => api.get('/stats');
export const forgotPassword = (data) => api.post('/forgot-password', data);
export const resetPassword = (data) => api.post('/reset-password', data);

// Properties
export const getProperties = () => api.get('/properties');
export const getProperty = (id) => api.get(`/properties/${id}`);
export const createProperty = (data) => api.post('/properties', data);
export const updateProperty = (id, data) => api.put(`/properties/${id}`, data);
export const deleteProperty = (id) => api.delete(`/properties/${id}`);

// Plants
export const getPlants = () => api.get('/plants');
export const getPlant = (id) => api.get(`/plants/${id}`);
export const recommendPlants = (propertyId, budget) => {
    let url = `/plants/recommend?property_id=${propertyId}`;
    if (budget) url += `&budget=${budget}`;
    return api.get(url);
};
export const createPlant = (data) => api.post('/plants', data);
export const updatePlant = (id, data) => api.put(`/plants/${id}`, data);
export const deletePlant = (id) => api.delete(`/plants/${id}`);

// Garden Plans
export const getGardenPlans = (propertyId) => api.get(`/garden_plans?property_id=${propertyId}`);
export const getGardenPlan = (id) => api.get(`/garden_plans/${id}`);
export const createGardenPlan = (data) => api.post('/garden_plans', data);
export const updateGardenPlan = (id, data) => api.put(`/garden_plans/${id}`, data);
export const deleteGardenPlan = (id) => api.delete(`/garden_plans/${id}`);
export const addPlanItem = (planId, data) => api.post(`/garden_plans/${planId}/items`, data);
export const deletePlanItem = (planId, itemId) => api.delete(`/garden_plans/${planId}/items/${itemId}`);
export const getPlanTotal = (planId) => api.get(`/garden_plans/${planId}/total`);
export const getPlanQuantity = (planId) => api.get(`/garden_plans/${planId}/quantity`);
export const generatePdf = (planId) => api.get(`/garden_plans/${planId}/pdf`, { responseType: 'blob' });
export const getCanvasElements = (planId) => api.get(`/garden_plans/${planId}/canvas`);
export const saveCanvasElements = (planId, data) => api.put(`/garden_plans/${planId}/canvas`, data);

export default api;