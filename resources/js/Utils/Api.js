import axios from 'axios';

const appUrl = import.meta.env.VITE_APP_URL;
import { Store } from '../Store';

const listenApi = axios.create({
    baseURL: `${appUrl}/api/`,
    withCredentials: true,
});

// Attach token automatically
listenApi.interceptors.request.use((config) => {
    const token = Store.getState()?.auth?.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default listenApi;
