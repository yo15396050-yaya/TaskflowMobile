import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const API_URL = 'http://192.168.1.18/CRM_old/public/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 30000,
});

// Liste des messages JWT qui indiquent un problème d'authentification
const JWT_AUTH_ERRORS = [
    'token not provided',
    'token has expired',
    'token is invalid',
    'token blacklisted',
    'token not found',
    'could not decode token',
    'unauthenticated',
];

/**
 * Vérifie si une erreur serveur est en réalité un problème d'authentification JWT
 */
const isJwtAuthError = (error: any): boolean => {
    const message = (
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        ''
    ).toLowerCase();
    return JWT_AUTH_ERRORS.some(jwtErr => message.includes(jwtErr));
};

/**
 * Gère la déconnexion suite à un problème d'authentification
 */
const handleAuthFailure = async () => {
    console.log('🔒 Session expirée ou token invalide — redirection vers login');
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('user_data');
    try {
        router.replace('/login');
    } catch (e) {
        // Le router n'est peut-être pas encore monté
    }
};

// Intercepteur de requête : attache le token JWT
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('user_token');
    if (token && !config.url?.includes('/login')) {
        config.params = { ...config.params, token: token };
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🚀 [API CALL] ${config.baseURL}${config.url}?token=...`);
    } else if (config.url?.includes('/login')) {
        console.log(`🚀 [API CALL] ${config.baseURL}${config.url} (POST Login)`);
    } else {
        console.warn(`⚠️ Aucun token trouvé pour: ${config.url}`);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Intercepteur de réponse : gère les erreurs 401 ET les 500 JWT
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        // Cas 1 : 401 classique (Unauthorized)
        if (status === 401) {
            await handleAuthFailure();
            return Promise.reject(error);
        }

        // Cas 2 : 500 causé par le middleware tymon/jwt-auth (Token not provided, etc.)
        if (status === 500 && isJwtAuthError(error)) {
            await handleAuthFailure();
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default api;
