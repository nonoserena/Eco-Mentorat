import axios from 'axios';

// Docker-first : via Nginx (port 8082) on utilise /api, en dev local on garde 5000
const getBaseURL = () => {
    if (import.meta?.env?.VITE_API_URL) return import.meta.env.VITE_API_URL;
    return '/api';
};

const API = axios.create({
    baseURL: getBaseURL()
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

// Demandes (multilingue pays : JP voit JA, AR voit AR, BR voit PT via viewerLang)
export const getRequests     = (page, limit, lang) => API.get(`/requests/all?page=${page}&limit=${limit}${lang ? `&lang=${lang}` : ''}`);
export const createRequest   = (data)        => API.post('/requests/create', data);
export const autoTagRequest  = (data) => API.post('/requests/auto-tag', data);
export const voiceTranscribeRequest = (data) => API.post('/requests/voice-transcribe', data);
export const scanExercisePhoto = (data) => API.post('/requests/scan-exercise', data);
export const acceptRequest   = (data)        => API.post('/requests/accept', data);
export const completeRequest = (data)        => API.post('/requests/complete', data);
export const replaceMentor   = (data)        => API.post('/requests/replace-mentor', data);
export const getRequestById  = (id)          => API.get(`/requests/${id}`);

// Historique (multilingue pays)
export const getMyRequests = (page, limit, lang) => API.get(`/requests/my-requests?page=${page}&limit=${limit}${lang ? `&lang=${lang}` : ''}`);
export const getMyHelps    = (page, limit, lang) => API.get(`/requests/my-helps?page=${page}&limit=${limit}${lang ? `&lang=${lang}` : ''}`);
export const getHistory    = (page, limit, lang) => API.get(`/requests/history?page=${page}&limit=${limit}${lang ? `&lang=${lang}` : ''}`);

// Leaderboard
export const getLeaderboard = (skill) =>
    API.get(`/users/leaderboard${skill ? `?skill=${skill}` : ''}`);

// Portfolio PDF
export const getPortfolio = (id) =>
    API.get(`/users/${id}/portfolio`, { responseType: 'blob' });

// Chat
export const sendMessage    = (data) => API.post('/chat/message', data);
export const getChatHistory = (requestId) => API.get(`/chat/${requestId}/history`);

// Meta AI — Traduction universelle NLLB-200 + Llama 3
export const translateText = (data) => API.post('/translate', data);

// Utilisateurs
export const getMyProfile     = () => API.get('/users/me');
export const getPublicProfile = (username) => API.get(`/users/public/${username}`);
export const updateMyLang = (preferredLang) => API.patch('/users/me/lang', { preferredLang });

export default API;