import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './Router/AppRouter';
import { Provider } from 'react-redux';
import { Store } from './Store';
import('izitoast/dist/css/iziToast.min.css')
ReactDOM.createRoot(document.getElementById('app')).render(
    <Provider store={Store}>
        <AppRouter />
    </Provider>,
);
