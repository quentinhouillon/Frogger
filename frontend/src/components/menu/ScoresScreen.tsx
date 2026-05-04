import React from 'react';
import { motion } from 'framer-motion';
import type { HighScoreEntry } from '../../types/GameTypes';

interface Props {
    highScores: HighScoreEntry[];
    onBack: () => void;
}

const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

const ScoresScreen: React.FC<Props> = ({ highScores, onBack }) => (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center gap-8 select-none"
         style={{ background: 'radial-gradient(ellipse at top, #0d1b2a 0%, #000508 100%)' }}>

        <motion.h1
            className="font-[family-name:var(--font-orbitron)] text-3xl font-black tracking-[0.2em] text-[#ffd700] m-0"
            style={{ textShadow: '0 0 20px rgba(255,215,0,0.4)' }}
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            MEILLEURS SCORES
        </motion.h1>

        <motion.div className="w-80 rounded-2xl border border-[#ffd700]/20 overflow-hidden"
            style={{ background: 'rgba(0,20,10,0.75)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

            {highScores.length === 0 ? (
                <p className="font-[family-name:var(--font-orbitron)] text-sm text-white/30 text-center py-10">
                    Aucun score enregistré
                </p>
            ) : highScores.map((entry, i) => (
                <motion.div key={i}
                    className="flex items-center gap-4 px-6 py-3 border-b border-white/5 last:border-0"
                    initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15 + i * 0.06 }}>
                    <span className="text-2xl w-8 text-center">{medals[i]}</span>
                    <span className="font-[family-name:var(--font-orbitron)] text-xl font-black text-white flex-1">
                        {entry.score}
                    </span>
                    <span className="font-mono text-xs text-white/35">{entry.date}</span>
                </motion.div>
            ))}
        </motion.div>

        <motion.button onClick={onBack}
            className="font-[family-name:var(--font-orbitron)] text-sm tracking-widest text-white/50 hover:text-white border border-white/20 hover:border-white/50 px-8 py-2 rounded-lg transition-all cursor-pointer"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            ← RETOUR
        </motion.button>
    </div>
);

export default ScoresScreen;
