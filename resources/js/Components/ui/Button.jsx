import { DynamicIcon } from 'lucide-react/dynamic';
import { motion } from 'framer-motion';

const Button = ({ variant = 'default', size = 'md', className = '', icon = null, children, iconSize = 16, ...props }) => {

    const variantClass = {
        rose: `
        bg-rose-600 text-white
        hover:bg-rose-700 hover:text-gray-200
        shadow-md shadow-rose-500/25 hover:shadow-rose-500/40
        hover:ring hover:ring-rose-400/40
        ring-offset-1 ring-offset-transparent
        transition-all duration-200 ease-out
    `,

        secondary: `
        bg-gray-800 text-gray-300
        hover:bg-gray-700 hover:text-white
        shadow-md shadow-gray-500/25 hover:shadow-gray-500/40
        hover:ring hover:ring-gray-400/30
        ring-offset-1 ring-offset-transparent
        transition-all duration-200 ease-out
    `,

        purple: `
        bg-gradient-to-r from-purple-600 to-pink-600
        text-gray-100 hover:text-white
        shadow-md shadow-purple-500/25 hover:shadow-purple-500/40
        hover:ring hover:ring-pink-400/40
        ring-offset-1 ring-offset-transparent
        transition-all duration-200 ease-out
    `,
        roseGradient: `
        bg-gradient-to-r from-rose-600 to-gray-600
        text-rose-100 hover:text-white
        shadow-md shadow-purple-rose/25 hover:shadow-gray-500/40
        hover:ring hover:ring-gray-400/40
        ring-offset-1 ring-offset-transparent
        transition-all duration-200 ease-out
    `,

        success: `
        bg-gradient-to-r from-green-500 via-green-600 to-green-700
        text-gray-100 hover:text-white
        shadow-md shadow-green-500/25 hover:shadow-green-900/40
        hover:ring hover:ring-green-400/40
        ring-offset-1 ring-offset-transparent
        transition-all duration-200 ease-out
    `,
    }[variant];

    const sizeVariant = {
        'lg': 'px-4 py-3',
        'md': 'px-4 py-2',
        'sm': 'px-3 py-2 text-sm',
        'xsm': 'px-1 py-1 text-xs',
    }[size];

    const commonClass = 'flex items-center justify-center gap-2 rounded-lg cursor-pointer';
    
    return <>
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${commonClass} ${variantClass} ${sizeVariant} ${className}`} {...props}>
            {icon && <DynamicIcon name={icon} size={iconSize} />}
            {children}
        </motion.button>
    </>;
};

export default Button;
