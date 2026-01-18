import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import GuestLayout from "../Layouts/GuestLayout";
import AuthLayout from "../Layouts/AuthLayout";

import Login from "../Pages/Web/Login";
import Home from '../Pages/Home';
import AccountIndex from '../Pages/Auth/AccountSettings';
import ChatIndex from '../Pages/Auth/Chat';
import NotFound from '../Pages/NotFound';


import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    return isAuthenticated ? children : <Navigate to="/" replace />;
};

const GuestRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    return !isAuthenticated ? children : <Navigate to="/user/dashboard" replace />;
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <GuestLayout />,
        errorElement: <NotFound />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/start-new", element: <GuestRoute><Login /></GuestRoute> },
        ]
    },
    {
        element: <ProtectedRoute><AuthLayout /></ProtectedRoute>,
        errorElement: <NotFound />,
        children: [
            { path: "/user/dashboard", element: <Navigate to="/chat/new" replace /> },
            { path: "/user/account", element: <AccountIndex /> },
            { path: "/chat/new", element: <ChatIndex /> },
            { path: "/chat/new/:sessionId?", element: <ChatIndex /> },
            { path: "/user/start-chat", element: <Navigate to="/chat/new" replace /> },
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}
