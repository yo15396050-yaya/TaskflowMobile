import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const API_URL = 'http://192.168.1.21/CRM_old/public/api/';

/**
 * Service API utilisant Fetch (plus stable qu'Axios sur ce réseau/appareil)
 * Garde la même interface qu'Axios pour la compatibilité.
 */
const api = {
    baseURL: API_URL,

    async request(url: string, options: any = {}) {
        // 1. Nettoyage et construction de l'URL
        let fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url.startsWith('/') ? url.substring(1) : url}`;
        
        // 2. Gestion des paramètres (Query String)
        const params = options.params || {};
        const token = await SecureStore.getItemAsync('user_token');
        if (token && !url.includes('login')) {
            params.token = token;
        }

        const queryString = Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');

        if (queryString) {
            fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
        }
        
        // 3. En-têtes (Headers)
        let headers: any = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token && !url.includes('login')) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        console.log(`📡 [API ${options.method || 'GET'}] ${fullUrl}`);

        try {
            const response = await fetch(fullUrl, {
                method: options.method || 'GET',
                headers: headers,
                body: options.data ? JSON.stringify(options.data) : undefined,
            });

            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
                console.log(`📦 [DATA RECEIVED] ${fullUrl.split('?')[0]}:`, JSON.stringify(data).substring(0, 200));
            } else {
                const text = await response.text();
                console.warn(`⚠️ Réponse non-JSON reçue de ${fullUrl}:`, text.substring(0, 200));
                data = { message: text };
            }

            // Gestion des erreurs d'auth (401)
            if (response.status === 401) {
                console.log('🔒 Session expirée - Redirection login');
                await SecureStore.deleteItemAsync('user_token');
                router.replace('/login');
                return Promise.reject({ response: { status: 401, data } });
            }

            if (!response.ok) {
                console.error(`❌ Erreur ${response.status} sur ${fullUrl}`);
                return Promise.reject({ response: { status: response.status, data } });
            }

            return { data, status: response.status };
        } catch (error: any) {
            console.error('🔥 Erreur fatale API:', error.message);
            throw error;
        }
    },

    get(url: string, config: any = {}) {
        return this.request(url, { ...config, method: 'GET' });
    },

    post(url: string, data: any = {}, config: any = {}) {
        return this.request(url, { ...config, method: 'POST', data });
    },

    put(url: string, data: any = {}, config: any = {}) {
        return this.request(url, { ...config, method: 'PUT', data });
    },

    delete(url: string, config: any = {}) {
        return this.request(url, { ...config, method: 'DELETE' });
    }
};

export default api;
