import React from 'react';
import { motion } from 'framer-motion';

interface Props { onBack: () => void; }

const team = [
    { role: 'Développement',  name: 'Daril DJODJO KOUTON' },
    { role: 'Développement',  name: 'Quentin HOUILLON' },
    { role: 'Développement',  name: 'Leticia ALKILAL' },
];

const CreditsScreen: React.FC<Props> = ({ onBack }) => (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center gap-8 select-none"
         style={{ background: 'radial-gradient(ellipse at top, #0d1b2a 0%, #000508 100%)' }}>

        <motion.h1
            className="font-[family-name:var(--font-orbitron)] text-3xl font-black tracking-[0.2em] text-[#cf9fff] m-0"
            style={{ textShadow: '0 0 20px rgba(207,159,255,0.4)' }}
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            CRÉDITS
        </motion.h1>

        <motion.div className="flex flex-col gap-6 w-80 rounded-2xl border border-[#cf9fff]/20 p-8"
            style={{ background: 'rgba(0,20,10,0.75)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

            {/* Projet */}
            <div className="text-center">
                <p className="font-[family-name:var(--font-orbitron)] text-xl font-black text-[#50ff8c] m-0">🐸 FROGGER</p>
                <p className="font-[family-name:var(--font-orbitron)] text-[0.6rem] tracking-[0.25em] text-white/30 mt-1 m-0">
                    PROJET L3 — PROGRAMMATION ORIENTÉE OBJET
                </p>
            </div>

            <div className="border-t border-white/10" />

            {/* Équipe */}
            {team.map(({ role, name }, i) => (
                <motion.div key={i} className="flex flex-col gap-0.5"
                    initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.08 }}>
                    <span className="font-[family-name:var(--font-orbitron)] text-[0.55rem] tracking-[0.2em] text-[#cf9fff]/60 uppercase">
                        {role}
                    </span>
                    <span className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-white">
                        {name}
                    </span>
                </motion.div>
            ))}

            <div className="border-t border-white/10" />

            {/* Stack */}
            <div className="flex flex-col gap-0.5">
                <span className="font-[family-name:var(--font-orbitron)] text-[0.55rem] tracking-[0.2em] text-[#cf9fff]/60 uppercase mb-1">
                    Stack technique
                </span>
                {['Java 21 + WebSocket', 'React 19 + TypeScript', 'Framer Motion + Tailwind'].map((tech, i) => (
                    <span key={i} className="font-mono text-xs text-white/50">• {tech}</span>
                ))}
            </div>
        </motion.div>

        <motion.button onClick={onBack}
            className="font-[family-name:var(--font-orbitron)] text-sm tracking-widest text-white/50 hover:text-white border border-white/20 hover:border-white/50 px-8 py-2 rounded-lg transition-all cursor-pointer"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            ← RETOUR
        </motion.button>
    </div>
);

export default CreditsScreen;
