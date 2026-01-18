// Badge.jsx
import { X } from 'lucide-react';

const Badge = ({
                   children,
                   variant = 'default',  // default, primary, success, warning, danger, purple
                   size = 'md',          // sm, md, lg
                   rounded = 'full',     // none, sm, md, full
                   onRemove,
                   className = '',
                  ...props
               }) => {

    // Variant styles
    const variantStyles = {
        default: 'bg-gray-800 text-gray-200',
        primary: 'bg-blue-600 text-white',
        success: 'bg-green-600 text-white',
        warning: 'bg-yellow-600 text-white',
        danger: 'bg-red-600 text-white',
        purple: 'bg-purple-600 text-white',
        pink: 'bg-pink-600 text-white',
    };

    // Size styles
    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    // Border radius
    const roundedStyles = {
        none: 'rounded-none',
        sm: 'rounded',
        md: 'rounded-md',
        full: 'rounded-full',
    };

    return (
        <div
            className={`
        inline-flex items-center justify-center
        font-medium whitespace-nowrap
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${roundedStyles[rounded]}
        ${className}
      `}
            {...props}
        >
            {children}
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-2 -mr-1 hover:opacity-80"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </div>
    );
};

export default Badge;
