import React from 'react';
import { motion } from 'framer-motion';
import type { HighScoreEntry } from '../../types/GameTypes';

interface Props {
    highScores: HighScoreEntry[];
    onBack: () => void;
}

const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

const ScoresScreen: React.FC<Props> = ({ highScores, onBack }) => (
    <div
        className="min-h-screen w-screen flex flex-col items-center justify-center gap-8 select-none px-4"
        style={{
            background: 'radial-gradient(circle at top, rgba(255,255,80,0.12) 0%, rgba(8,8,1,0.86) 40%, rgba(0,0,0,0.92) 100%)',
            backdropFilter: 'blur(5px)',
        }}
    >
        <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border p-8 text-white"
            style={{
                borderColor: 'rgba(255,255,80,0.35)',
                background: 'linear-gradient(165deg, rgba(18,18,5,0.97) 0%, rgba(10,10,6,0.97) 100%)',
                boxShadow: '0 0 0 1px rgba(24,24,15,0.9), 0 0 50px rgba(255,255,80,0.16), 0 20px 60px rgba(0,0,0,0.75)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(255,255,80,0.22), rgba(255,255,80,0))' }}
            />

            <div className="mb-6">
                <p className="m-0 text-xs uppercase tracking-[0.25em] text-[#ffff99]">Frogger</p>
                <h1 className="m-0 text-3xl font-semibold tracking-wide text-[#ffffe9]">Meilleurs Scores</h1>
            </div>

            {highScores.length === 0 ? (
                <p className="text-sm text-[#ffff99] text-center py-8">Aucun score enregistré</p>
            ) : (
                <div className="space-y-2 mb-6">
                    {highScores.map((entry, i) => (
                        <motion.div
                            key={i}
                            className="flex items-center gap-4 px-4 py-3 rounded-lg border transition"
                            style={{
                                borderColor: 'rgba(255,255,80,0.22)',
                                background: 'rgba(24,24,9,0.55)',
                            }}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                        >
                            <span className="text-2xl w-8 text-center">{medals[i]}</span>
                            <span className="text-lg font-semibold text-[#fffef8] flex-1">{entry.score}</span>
                            <span className="text-xs text-[#c8c888]">{entry.date}</span>
                        </motion.div>
                    ))}
                </div>
            )}

            <motion.button
                onClick={onBack}
                className="w-full rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:scale-[1.02]"
                style={{
                    borderColor: 'rgba(255,255,140,0.44)',
                    background: 'linear-gradient(180deg, rgba(255,255,140,0.16), rgba(96,96,35,0.35))',
                    color: '#ffffda',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
            >
                ← Retour
            </motion.button>
        </motion.div>
    </div>
);

export default ScoresScreen;
