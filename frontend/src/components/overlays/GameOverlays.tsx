import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { HighScoreEntry } from '../../types/GameTypes';

interface OverlayProps {
    isVisible:   boolean;
    onReset?:    () => void;
    onMenu?:     () => void;
    highScores?: HighScoreEntry[];
}

const ScoreTable: React.FC<{ entries: HighScoreEntry[]; accent: string }> = ({ entries, accent }) => (
    <motion.div
        className="mt-1 w-48"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
        transition={{ delay: 0.2 }}
    >
        <p className={`font-[family-name:var(--font-orbitron)] text-[0.55rem] tracking-[0.2em] uppercase text-center mb-1 text-[${accent}]/70`}>
            Meilleurs scores
        </p>
        {entries.map((entry, i) => (
            <div key={i} className="flex justify-between text-white/80 text-xs font-mono px-2 py-0.5 odd:bg-white/5 rounded">
                <span style={{ color: accent + 'cc' }}>#{i + 1}</span>
                <span className="font-bold">{entry.score}</span>
                <span className="text-white/40">{entry.date}</span>
            </div>
        ))}
    </motion.div>
);

export const GameOverOverlay: React.FC<OverlayProps> = ({ isVisible, onReset, onMenu, highScores }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div
                className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3"
                style={{ background: 'radial-gradient(ellipse at center, rgba(200,0,0,0.55) 0%, rgba(0,0,0,0.8) 70%)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <motion.span className="text-6xl"
                    animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                    💀
                </motion.span>
                <motion.p
                    className="font-[family-name:var(--font-orbitron)] text-4xl font-black tracking-[0.2em] text-[#ff5555] m-0"
                    style={{ textShadow: '0 0 20px #ff5555, 0 2px 0 rgba(0,0,0,0.5)' }}
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                >
                    GAME OVER
                </motion.p>

                {highScores && highScores.length > 0 && <ScoreTable entries={highScores} accent="#ff5555" />}

                <motion.div className="flex gap-3 mt-2"
                    initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
                    {onReset && (
                        <button onClick={onReset}
                            className="px-6 py-2 rounded-lg font-black tracking-widest text-black bg-[#ff5555] hover:bg-white transition-colors cursor-pointer">
                            REJOUER
                        </button>
                    )}
                    {onMenu && (
                        <button onClick={onMenu}
                            className="px-6 py-2 rounded-lg font-black tracking-widest text-white/80 border border-white/30 hover:bg-white/10 transition-colors cursor-pointer">
                            MENU
                        </button>
                    )}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export const VictoryOverlay: React.FC<OverlayProps> = ({ isVisible, onReset, onMenu, highScores }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div
                className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3"
                style={{ background: 'radial-gradient(ellipse at center, rgba(255,200,0,0.45) 0%, rgba(0,0,0,0.8) 70%)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <motion.span className="text-6xl"
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                    🏆
                </motion.span>
                <motion.p
                    className="font-[family-name:var(--font-orbitron)] text-4xl font-black tracking-[0.2em] text-[#ffd700] m-0"
                    style={{ textShadow: '0 0 20px #ffd700, 0 2px 0 rgba(0,0,0,0.5)' }}
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
                >
                    VICTORY!
                </motion.p>

                {highScores && highScores.length > 0 && <ScoreTable entries={highScores} accent="#ffd700" />}

                <motion.div className="flex gap-3 mt-2"
                    initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
                    {onReset && (
                        <button onClick={onReset}
                            className="px-6 py-2 rounded-lg font-black tracking-widest text-black bg-[#ffd700] hover:bg-white transition-colors cursor-pointer">
                            REJOUER
                        </button>
                    )}
                    {onMenu && (
                        <button onClick={onMenu}
                            className="px-6 py-2 rounded-lg font-black tracking-widest text-white/80 border border-white/30 hover:bg-white/10 transition-colors cursor-pointer">
                            MENU
                        </button>
                    )}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);
