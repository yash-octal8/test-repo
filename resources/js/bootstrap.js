import axios from 'axios';
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
import { Store } from './Store';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
window.Pusher = Pusher;

export const initEcho = () => {
    const { token } = Store.getState()?.auth || {};

    // Check if Echo is already initialized with the same token
    if (window.Echo && window.Echo.options.auth.headers.Authorization === `Bearer ${token}`) {
        return window.Echo;
    }

    if (window.Echo) {
        window.Echo.disconnect();
    }

    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
        auth: {
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
            },
        },
        forceTLS: false,
        enabledTransports: ['ws'],
        authEndpoint: '/api/broadcasting/auth',
        withCredentials: true,
    });

    return window.Echo;
};

// Initialize on load
initEcho();
