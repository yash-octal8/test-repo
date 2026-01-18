import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Description,
} from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";

export default function DialogBox(props) {
    const {
        variant = 'light',
        maxWidth = 'max-w-lg',
        isOpen,
        title,
        children,
        actions,
        className
    } = props;

    const modelBg = {
        pink: {
            bg: 'bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 text-white hover:opacity-90 border-gray-600',
            text: 'text-gray-900',
        },
        gray: {
            bg: 'bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white hover:opacity-90 border-gray-600',
            text: 'text-white',
        },
        light: {
            bg: 'bg-white border-gray-100',
            text: 'text-gray-900',
        },
        rose: {
            bg: 'bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 text-white hover:opacity-90 border-gray-600',
            text: 'text-gray-900',
        },
        dark: {
            bg: 'bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white hover:opacity-90 border-gray-600',
            text: 'text-gray-200',
        },
        // Additional variants:
        purple: {
            bg: 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white hover:opacity-90 border-gray-600',
            text: 'text-white',
        },
        cyan: {
            bg: 'bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 text-white hover:opacity-90 border-gray-600',
            text: 'text-gray-900',
        },
        amber: {
            bg: 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white hover:opacity-90 border-gray-600',
            text: 'text-gray-900',
        },
        // Fun gradients:
        sunset: {
            bg: 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white hover:opacity-90',
            text: 'text-white',
        },
        ocean: {
            bg: 'bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-600 text-white hover:opacity-90',
            text: 'text-white',
        },
        // Simple solid colors:
        red: {
            bg: 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:opacity-90',
            text: 'text-white',
        },
        yellow: {
            bg: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 hover:opacity-90',
            text: 'text-gray-900',
        },
        lime: {
            bg: 'bg-gradient-to-r from-lime-500 via-lime-600 to-lime-700 text-gray-900 hover:opacity-90',
            text: 'text-gray-900',
        },
    }[variant];

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <Dialog
                        static
                        open={isOpen}
                        onClose={() => { }}
                        className="relative z-50"
                    >
                        {/* Background Overlay */}
                        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm" aria-hidden="true" />

                        {/* Center Wrapper */}
                        <div className="fixed inset-0 flex items-center justify-center p-4">
                            <DialogPanel
                                as={motion.div}
                                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    transition: {
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 22,
                                    },
                                }}
                                exit={{
                                    opacity: 0,
                                    y: 100,
                                    scale: 0.95,
                                    transition: { duration: 0.2 },
                                }}
                                className={`${maxWidth} w-full
    rounded-2xl shadow-xl p-8 space-y-4
    border ${modelBg.bg} ${modelBg.text} ${className}`}
                            >
                                <DialogTitle className={`text-xl font-semibold ${modelBg.text}`}>
                                    {title}
                                </DialogTitle>

                                <div
                                    className={`${modelBg.text}`}>
                                    {children}
                                </div>
                                <div>
                                    {actions}
                                </div>
                            </DialogPanel>
                        </div>
                    </Dialog>
                )}
            </AnimatePresence>
        </>
    );
}
