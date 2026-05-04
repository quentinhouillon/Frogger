import React from 'react';
import { motion } from 'framer-motion';
import type { Screen } from '../../App';

interface Props { onNavigate: (s: Screen) => void; }

const buttons: { label: string; screen: Screen; color: string }[] = [
    { label: 'JOUER',           screen: 'game',     color: '#50ff8c' },
    { label: 'MEILLEURS SCORES', screen: 'scores',  color: '#ffd700' },
    { label: 'PARAMÈTRES',      screen: 'settings', color: '#80cfff' },
    { label: 'CRÉDITS',         screen: 'credits',  color: '#cf9fff' },
];

const MenuScreen: React.FC<Props> = ({ onNavigate }) => (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center gap-10 select-none"
         style={{ background: 'radial-gradient(ellipse at top, #0d1b2a 0%, #000508 100%)' }}>

        {/* Titre */}
        <motion.div className="flex flex-col items-center gap-2"
            initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
            <motion.span className="text-7xl"
                animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}>
                🐸
            </motion.span>
            <h1 className="font-[family-name:var(--font-orbitron)] text-5xl font-black tracking-[0.2em] text-[#50ff8c] m-0"
                style={{ textShadow: '0 0 30px rgba(80,255,140,0.5)' }}>
                FROGGER
            </h1>
            <p className="font-[family-name:var(--font-orbitron)] text-xs tracking-[0.3em] text-[#50ff8c]/40 m-0 uppercase">
                Traverse. Survive. Conquer.
            </p>
        </motion.div>

        {/* Boutons */}
        <motion.div className="flex flex-col gap-3 w-64"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {buttons.map(({ label, screen, color }, i) => (
                <motion.button
                    key={screen}
                    onClick={() => onNavigate(screen)}
                    className="w-full py-3 rounded-xl font-[family-name:var(--font-orbitron)] font-black tracking-widest text-sm border-2 transition-all cursor-pointer"
                    style={{ borderColor: color + '55', color, background: 'transparent' }}
                    whileHover={{ scale: 1.04, borderColor: color, boxShadow: `0 0 20px ${color}44` }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0,   opacity: 1 }}
                    transition={{ delay: 0.35 + i * 0.07 }}
                >
                    {label}
                </motion.button>
            ))}
        </motion.div>
    </div>
);

export default MenuScreen;
