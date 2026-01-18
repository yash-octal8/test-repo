import { DynamicIcon } from "lucide-react/dynamic";

const Input = ({
                   label,
                   error,
                   icon,           // right-side icon
                   iconLeft,       // left-side icon
                   prefix,         // text inside left
                   prepend,        // button/element left OUTSIDE input
                   append,         // button/element right OUTSIDE input
                   variant = "gray",
                   className = "",
                   wrapperClass = "",
                   ...props
               }) => {
    const variants = {
        pink: "focus:ring-pink-500 border-pink-500 placeholder-gray-600",
        gray: "focus:ring-indigo-500 border-gray-700 placeholder-gray-600",
        rose: "focus:ring-rose-500 border-rose-500 placeholder-gray-600",
        darkest: "focus:ring-gray-900 border-gray-900 placeholder-gray-600",
    };

    return (
        <div className={`flex flex-col gap-1 ${wrapperClass}`}>

            {/* Label */}
            {label && <label className={`text-sm font-medium text-gray-200 
            ${props.disabled ? 'opacity-50' : ''}`}>{label}</label>}

            <div className="flex items-stretch gap-2">

                {/* Prepend (outside left button/element) */}
                {prepend && (
                    <div className="flex items-center">
                        {prepend}
                    </div>
                )}

                {/* Input Wrapper */}
                <div className={`relative flex items-center w-full`}>

                    {/* Prefix Text */}
                    {prefix && (
                        <span className="absolute left-3 text-gray-400 pointer-events-none">
                            {prefix}
                        </span>
                    )}

                    {/* Left Icon */}
                    {iconLeft && (
                        <span className="absolute left-3 text-gray-400 pointer-events-none">
                            <DynamicIcon name={iconLeft} size={18} />
                        </span>
                    )}

                    {/* Input Element */}
                    <input
                        className={`
                            w-full bg-gray-800 text-white rounded-lg border px-3 py-2
                            focus:ring-2 transition-all focus:border-transparent
                            ${variants[variant]}
                            ${iconLeft ? "pl-10" : prefix ? "pl-10" : ""}
                            ${icon ? "pr-10" : ""}
                            ${className}
                            ${props.disabled ? 'opacity-50' : ''}
                        `}
                        {...props}
                    />

                    {/* Right Icon */}
                    {icon && (
                        <span className="absolute right-3 text-gray-400 pointer-events-none">
                            <DynamicIcon name={icon} size={18} />
                        </span>
                    )}
                </div>

                {/* Append (outside right button/element) */}
                {append && (
                    <div className="flex items-center">
                        {append}
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
            )}

        </div>
    );
};

export default Input;
