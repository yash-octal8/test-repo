import { motion } from "framer-motion";

const Toggle = ({
                    value = false,
                    onChange = () => {},
                    size = "md",
                    variant = "rose",
                    disabled = false,
                    className = "",
                    ...props
                }) => {

    const sizes = {
        sm: { track: "w-10 h-5", knob: "w-4 h-4", translate: 20 },
        md: { track: "w-12 h-6", knob: "w-5 h-5", translate: 24 },
        lg: { track: "w-14 h-7", knob: "w-6 h-6", translate: 28 },
    }[size];

    const variants = {
        pink: "bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700",
        gray: "bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800",
        rose: "bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700",
        darkest: "bg-gradient-to-r from-gray-900 via-black to-gray-900",
    };

    return (
        <button
            onClick={() => !disabled && onChange(!value)}
            className={`
                relative rounded-full transition 
                ${sizes.track} 
                ${value ? variants[variant] : "bg-gray-400 dark:bg-gray-700"} 
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} 
                ${className}
            `}
            {...props}
        >
            <motion.div
                initial={false}
                animate={{
                    x: value ? sizes.translate : 2,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`
                    absolute top-1/2 -translate-y-1/2 bg-white rounded-full shadow 
                    ${sizes.knob}
                `}
            />
        </button>
    );
};

export default Toggle;
