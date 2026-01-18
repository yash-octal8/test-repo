import { Outlet } from "react-router-dom";
import React from 'react';

export default function GuestLayout() {
    return (
        <div className="min-h-screen bg-gray-100">
            <main>
                <Outlet />
            </main>
        </div>
    );
}
