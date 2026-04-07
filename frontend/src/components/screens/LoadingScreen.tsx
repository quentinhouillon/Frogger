import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen: React.FC = () => {
    return (
        <div className="min-h-screen w-screen flex items-center justify-center"
             style={{ background: 'radial-gradient(ellipse at top, #0d1b2a 0%, #000508 100%)' }}>
            <div className="flex flex-col items-center gap-4">
                <motion.div
                    className="text-6xl"
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
                >
                    🐸
                </motion.div>
                <p className="font-[family-name:var(--font-orbitron)] text-base tracking-widest text-[#50ff8c]/70 m-0">
                    Connexion au serveur Frogger…
                </p>
                <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                        <motion.span
                            key={i}
                            className="w-2 h-2 rounded-full bg-[#50ff8c]"
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
