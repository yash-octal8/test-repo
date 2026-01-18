import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Custom useId hook for React < 18
const useId = () => {
    const idRef = useRef(null);

    if (idRef.current === null) {
        // Generate a simple unique ID
        idRef.current = `badge-${Math.random().toString(36).substr(2, 9)}`;
    }

    return idRef.current;
};

const GlowingBadge = ({
                          children,
                          color = 'blue',
                          size = 'md',
                          animated = true,
                          pulse = true,
                          className = '',
                          icon,
                          ...props
                      }) => {
    const id = useId();

    // Color configurations
    const colorConfigs = {
        blue: {
            gradient: 'linear-gradient(90deg, #3B82F6, #60A5FA, #3B82F6)',
            glow: '#3B82F6',
            text: 'text-white dark:text-white-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20'
        },
        green: {
            gradient: 'linear-gradient(90deg, #10B981, #34D399, #10B981)',
            glow: '#10B981',
            text: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/20'
        },
        purple: {
            gradient: 'linear-gradient(90deg, #8B5CF6, #A78BFA, #8B5CF6)',
            glow: '#8B5CF6',
            text: 'text-white-600 dark:text-white-400',
            bg: 'bg-purple-50 dark:bg-purple-900/20'
        },
        pink: {
            gradient: 'linear-gradient(90deg, #EC4899, #F472B6, #EC4899)',
            glow: '#EC4899',
            text: 'text-pink-600 dark:text-pink-400',
            bg: 'bg-pink-50 dark:bg-pink-900/20'
        },
        orange: {
            gradient: 'linear-gradient(90deg, #F59E0B, #FBBF24, #F59E0B)',
            glow: '#F59E0B',
            text: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-900/20'
        },
        red: {
            gradient: 'linear-gradient(90deg, #EF4444, #F87171, #EF4444)',
            glow: '#EF4444',
            text: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-900/20'
        },
        teal: {
            gradient: 'linear-gradient(90deg, #14B8A6, #2DD4BF, #14B8A6)',
            glow: '#14B8A6',
            text: 'text-teal-600 dark:text-teal-400',
            bg: 'bg-teal-50 dark:bg-teal-900/20'
        }
    };

    // Size configurations
    const sizeConfigs = {
        xs: {
            text: 'text-xs',
            padding: 'px-2 py-0.5',
            borderRadius: 'rounded-lg'
        },
        sm: {
            text: 'text-xs',
            padding: 'px-2.5 py-1',
            borderRadius: 'rounded-lg'
        },
        md: {
            text: 'text-sm',
            padding: 'px-3 py-1.5',
            borderRadius: 'rounded-xl'
        },
        lg: {
            text: 'text-base',
            padding: 'px-4 py-2',
            borderRadius: 'rounded-xl'
        },
        xl: {
            text: 'text-lg',
            padding: 'px-5 py-2.5',
            borderRadius: 'rounded-2xl'
        }
    };

    const config = colorConfigs[color] || colorConfigs.blue;
    const sizeConfig = sizeConfigs[size] || sizeConfigs.md;

    // Animation variants
    const borderAnimation = {
        animate: {
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }
    };

    const glowAnimation = {
        initial: { opacity: 0.7, scale: 1 },
        animate: {
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.02, 1],
        }
    };

    const pulseAnimation = {
        animate: {
            boxShadow: [
                `0 0 20px 0 ${config.glow}40`,
                `0 0 30px 5px ${config.glow}60`,
                `0 0 20px 0 ${config.glow}40`
            ],
        }
    };

    return (
        <div className={`relative inline-flex ${className}`} {...props}>
            {/* Glowing background effect */}
            {animated && (
                <motion.div
                    className={`absolute -inset-0.5 ${sizeConfig.borderRadius} blur opacity-75`}
                    style={{
                        background: config.gradient,
                        zIndex: 0
                    }}
                    variants={pulse ? pulseAnimation : glowAnimation}
                    animate={animated ? "animate" : "initial"}
                    initial="initial"
                    transition={{
                        duration: 2,
                        ease: "easeInOut",
                        repeat: Infinity
                    }}
                />
            )}

            {/* Animated border */}
            <motion.div
                className={`absolute -inset-0.5 ${sizeConfig.borderRadius} pointer-events-none`}
                style={{
                    background: animated ? config.gradient : config.glow,
                    zIndex: 1
                }}
                variants={borderAnimation}
                animate={animated ? "animate" : "initial"}
                transition={{
                    duration: 3,
                    ease: "linear",
                    repeat: Infinity
                }}
            />

            {/* Badge content */}
            <div
                className={`relative z-10 inline-flex items-center justify-center font-medium ${config.text} ${config.bg} ${sizeConfig.text} ${sizeConfig.padding} ${sizeConfig.borderRadius} backdrop-blur-sm border border-transparent`}
                style={{
                    background: 'inherit',
                    backgroundClip: 'padding-box'
                }}
            >
                {children}
                {icon && (
                    <span className="ml-1.5">
            {icon}
          </span>
                )}
            </div>

            {/* SVG filter for glow effect */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1, pointerEvents: 'none' }}>
                <defs>
                    <filter id={`glow-${id}`}>
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>
        </div>
    );
};

// Alternative: Simpler version without useId at all
const SimpleGlowingBadge = ({
                                children,
                                color = 'blue',
                                size = 'md',
                                animated = true,
                                pulse = true,
                                className = '',
                                icon,
                                ...props
                            }) => {
    // Generate a simple ID without hooks
    const badgeId = React.useMemo(() =>
            `badge-${Math.random().toString(36).substr(2, 9)}`,
        []
    );

    // ... rest of the component remains the same
    // Just replace `id` with `badgeId` in the SVG filter
};

// Export as before
const AnimatedBadge = {
    Base: GlowingBadge,

    Success: (props) => (
        <GlowingBadge color="green" {...props} />
    ),

    Error: (props) => (
        <GlowingBadge color="red" {...props} />
    ),

    Warning: (props) => (
        <GlowingBadge color="orange" {...props} />
    ),

    Info: (props) => (
        <GlowingBadge color="blue" {...props} />
    ),

    Premium: (props) => (
        <GlowingBadge
            color="purple"
            pulse={true}
            animated={true}
            {...props}
        />
    ),

    withIcon: (icon, props) => (
        <GlowingBadge icon={icon} {...props} />
    )
};

export default AnimatedBadge;
