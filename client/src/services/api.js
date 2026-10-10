import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// Injecte automatiquement le token JWT
API.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Redirige vers login si token expiré
API.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login    = (data) => API.post('/auth/login', data);

// Demandes
export const getRequests     = (page, limit) => API.get(`/requests/all?page=${page}&limit=${limit}`);
export const createRequest   = (data)        => API.post('/requests/create', data);
export const acceptRequest   = (data)        => API.post('/requests/accept', data);
export const completeRequest = (data)        => API.post('/requests/complete', data);
export const replaceMentor   = (data)        => API.post('/requests/replace-mentor', data);
export const getRequestById  = (id)          => API.get(`/requests/${id}`);

// Historique
export const getMyRequests = (page, limit) => API.get(`/requests/my-requests?page=${page}&limit=${limit}`);
export const getMyHelps    = (page, limit) => API.get(`/requests/my-helps?page=${page}&limit=${limit}`);
export const getHistory    = (page, limit) => API.get(`/requests/history?page=${page}&limit=${limit}`);

// Leaderboard
export const getLeaderboard = (skill) =>
    API.get(`/users/leaderboard${skill ? `?skill=${skill}` : ''}`);

// Portfolio PDF
export const getPortfolio = (id) =>
    API.get(`/users/${id}/portfolio`, { responseType: 'blob' });

// Chat
export const sendMessage    = (data) => API.post('/chat/message', data);
export const getChatHistory = (requestId) => API.get(`/chat/${requestId}/history`);

// Utilisateurs
export const getMyProfile     = () => API.get('/users/me');
export const getPublicProfile = (username) => API.get(`/users/public/${username}`);

export default API;