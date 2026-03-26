import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedScoreProps {
    score: number;
}

/**
 * Affiche le score avec une animation de "bump" à chaque changement.
 * Utilise AnimatePresence pour faire sortir l'ancien chiffre par le bas
 * et entrer le nouveau par le haut.
 */
const AnimatedScore: React.FC<AnimatedScoreProps> = ({ score }) => {
    return (
        <div className="flex flex-col items-center gap-0.5">
            <span className="font-[family-name:var(--font-orbitron)] text-[0.55rem] tracking-[0.2em] text-[#50ff8c]/55 uppercase">
                Score
            </span>

            {/* Le `key={score}` force React à recréer le composant à chaque changement */}
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={score}
                    className="font-[family-name:var(--font-orbitron)] text-lg font-bold"
                    style={{ color: 'white', textShadow: '0 0 12px rgba(80,255,140,0.7)' }}
                    initial={{ y: -14, opacity: 0, scale: 1.5 }}
                    animate={{ y: 0,   opacity: 1, scale: 1   }}
                    exit={{    y:  14, opacity: 0, scale: 0.6 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                >
                    {score}
                </motion.span>
            </AnimatePresence>
        </div>
    );
};

export default AnimatedScore;
