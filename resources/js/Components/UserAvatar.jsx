import React from "react";
import { User } from "lucide-react";

const UserAvatar = ({ src = null,
    size = 'md',
    variant = "circle",
    alt = "User Avatar",
    isActive = false,
    className = ""
}) => {

    const variantStyleClass = {
        'circle': 'rounded-full',
        'rounded': 'rounded-2xl',
        'rectangle': 'rounded-none',
    }[variant];

    const sizeClass = {
        'xs': 'w-8 h-8',
        'sm': 'w-12 h-12',
        'md': 'w-16 h-16',
        'lg': 'w-24 h-24',
        'xl': 'w-32 h-32',
        '2xl': 'w-48 h-48',
    }[size];

    const indicatorSizeClass = {
        'xs': 'w-2 h-2',
        'sm': 'w-3 h-3',
        'md': 'w-4 h-4',
        'lg': 'w-6 h-6',
        'xl': 'w-8 h-8',
        '2xl': 'w-10 h-10',
    }[size] || 'w-4 h-4';

    const commonClass = `relative border border-white/10 overflow-hidden bg-gray-800`;

    return (
        <div className={`relative ${sizeClass}`}>
            <div className={`${variantStyleClass} w-full h-full ${commonClass} ${className}`}>
                {src ? (
                    <img
                        src={src}
                        alt={alt}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <User size={size === 'xs' ? 14 : size === 'sm' ? 20 : 32} />
                    </div>
                )}
            </div>
            {isActive && (
                <span className={`absolute bottom-0 right-0 block rounded-full bg-green-500 border-2 border-[#0B0C10] ${indicatorSizeClass}`} />
            )}
        </div>
    );
};

export default UserAvatar;
