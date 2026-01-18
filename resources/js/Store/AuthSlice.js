import { createSlice } from '@reduxjs/toolkit';
import { __listenDecryptData, __listenEncryptData } from '../Utils/Crypto';
import { getCookie, setCookie, removeCookie } from '../Utils/Helper';

const authCookie = getCookie('auth');
const storedAuth = authCookie ?
    __listenDecryptData(authCookie) : {};

const AuthSlice = createSlice({
    name: 'auth',
    initialState: {
        user: storedAuth?.user || null,
        token: storedAuth?.token || null,
        isAuthenticated: !!storedAuth?.token,
    },
    reducers: {
        __listenSetUser: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            const encrypted = __listenEncryptData({
                token,
                user,
            });
            setCookie('auth', encrypted, 12);
        },
        __listenUpdateUser: (state, action) => {
            state.user = {
                ...state.user,
                ...action.payload,
            };
            const encrypted = __listenEncryptData({
                token: state.token,
                user: state.user,
            });

            setCookie('auth', encrypted, 12);
        },
        __listenLogout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            removeCookie('auth');
        },
    },
});

export const {
    __listenSetUser,
    __listenUpdateUser,
    __listenLogout,
} = AuthSlice.actions;

export default AuthSlice.reducer;
