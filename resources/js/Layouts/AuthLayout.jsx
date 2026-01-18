import { Outlet } from "react-router-dom";
import Navbar from './Navbar';
import { useState } from "react";

export default function AuthLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-spin-slow" />

                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <div className="relative flex min-h-screen">
                {/* Sidebar with glass effect */}
                <Navbar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* Main content */}
                <main className="flex-1 flex relative w-full animate-fade-in lg:pl-0">
                    <Outlet context={{ setIsSidebarOpen }} />
                </main>
            </div>
        </div>
    );
}
