import { configureStore } from '@reduxjs/toolkit';
import AuthSlice from './AuthSlice';
import ChatSlice from './ChatSlice';

export const Store = configureStore({
    reducer: {
        auth: AuthSlice,
        chat: ChatSlice,
    },
});
