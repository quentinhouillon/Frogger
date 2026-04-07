import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface OverlayProps {
    isVisible: boolean;
}

export const GameOverOverlay: React.FC<OverlayProps> = ({ isVisible }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div
                className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3"
                style={{ background: 'radial-gradient(ellipse at center, rgba(200,0,0,0.55) 0%, rgba(0,0,0,0.8) 70%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{    opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <motion.span
                    className="text-6xl"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                >
                    💀
                </motion.span>
                <motion.p
                    className="font-[family-name:var(--font-orbitron)] text-4xl font-black tracking-[0.2em] text-[#ff5555] m-0"
                    style={{ textShadow: '0 0 20px #ff5555, 0 2px 0 rgba(0,0,0,0.5)' }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0,  opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    GAME OVER
                </motion.p>
            </motion.div>
        )}
    </AnimatePresence>
);

export const VictoryOverlay: React.FC<OverlayProps> = ({ isVisible }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div
                className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3"
                style={{ background: 'radial-gradient(ellipse at center, rgba(255,200,0,0.45) 0%, rgba(0,0,0,0.8) 70%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{    opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <motion.span
                    className="text-6xl"
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                >
                    🏆
                </motion.span>
                <motion.p
                    className="font-[family-name:var(--font-orbitron)] text-4xl font-black tracking-[0.2em] text-[#ffd700] m-0"
                    style={{ textShadow: '0 0 20px #ffd700, 0 2px 0 rgba(0,0,0,0.5)' }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0,  opacity: 1 }}
                    transition={{ delay: 0.15 }}
                >
                    VICTORY!
                </motion.p>
            </motion.div>
        )}
    </AnimatePresence>
);
