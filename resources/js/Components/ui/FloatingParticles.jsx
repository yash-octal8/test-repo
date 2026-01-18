import { motion } from 'framer-motion';
import React from 'react';

const FloatingParticles = () => {
    return(
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-1">
        {[...Array(20)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-[2px] h-[2px] bg-white/30 rounded-full"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                }}
                animate={{
                    y: [0, -1000],
                    x: [0, Math.random() * 100 - 50],
                    opacity: [0, 1, 0],
                }}
                transition={{
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: "linear"
                }}
            />
        ))}
    </div>
    )
};

export default FloatingParticles;
