import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedScore from './AnimatedScore';
import type { GameState } from '../../types/GameTypes';

interface HUDProps {
    gameState: GameState;
    canvasW:   number;
    scale:     number;
}

const frogStateLabel: Record<string, string> = {
    LIVING: '🟢 En vie',
    DEAD:   '💀 Mort',
    WIN:    '🏆 Victoire !',
};

const Lives: React.FC<{ count: number; max: number }> = ({ count, max }) => (
    <div className="flex gap-1 h-7 items-center">
        {Array.from({ length: max }).map((_, i) => (
            <motion.span key={i} className="text-base" initial={false}
                animate={{
                    opacity: i < count ? 1 : 0.2,
                    scale:   i < count ? [1, 1.2, 1] : 0.8,
                    filter:  i < count ? 'drop-shadow(0 0 6px rgba(255,0,0,0.6))' : 'grayscale(100%)',
                }}
                transition={{ duration: 0.3 }}>
                ❤️
            </motion.span>
        ))}
    </div>
);

const HUD: React.FC<HUDProps> = ({ gameState, canvasW, scale }) => {
    const isMulti = gameState.multiplayerMode;

    return (
        <div className="flex items-center justify-between px-5 py-2.5 rounded-xl border backdrop-blur-md"
             style={{
                 width:      canvasW * scale,
                 background: 'rgba(0,20,10,0.75)',
                 borderColor: isMulti ? 'rgba(255,140,80,0.25)' : 'rgba(80,255,140,0.25)',
                 boxShadow:  '0 0 20px rgba(80,255,140,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
             }}>

            {/* ── J1 score ── */}
            <div className="flex flex-col items-center gap-0.5">
                {isMulti && (
                    <span className="font-[family-name:var(--font-orbitron)] text-[0.5rem] tracking-[0.2em] text-[#50ff8c]/60 uppercase">
                        J1
                    </span>
                )}
                <AnimatedScore score={gameState.score} />
            </div>

            {/* ── J1 vies ── */}
            <div className="flex flex-col items-center gap-0.5">
                <span className="font-[family-name:var(--font-orbitron)] text-[0.55rem] tracking-[0.2em] text-[#50ff8c]/55 uppercase">
                    {isMulti ? 'Vies J1' : 'Vies'}
                </span>
                <Lives count={gameState.lifes ?? 3} max={gameState.maxLifes ?? 3} />
            </div>

            {/* ── Titre ── */}
            <div className="font-[family-name:var(--font-orbitron)] text-2xl font-black tracking-[0.15em] text-[#50ff8c]"
                 style={{ textShadow: '0 0 16px rgba(80,255,140,0.6)' }}>
                🐸 FROGGER
            </div>

            {isMulti ? (
                <>
                    {/* ── J2 vies ── */}
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="font-[family-name:var(--font-orbitron)] text-[0.55rem] tracking-[0.2em] text-[#ff8c50]/55 uppercase">
                            Vies J2
                        </span>
                        <Lives count={gameState.lifes2 ?? 3} max={gameState.maxLifes ?? 3} />
                    </div>

                    {/* ── J2 score ── */}
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="font-[family-name:var(--font-orbitron)] text-[0.5rem] tracking-[0.2em] text-[#ff8c50]/60 uppercase">
                            J2
                        </span>
                        <AnimatedScore score={gameState.score2 ?? 0} color="#ff8c50" />
                    </div>
                </>
            ) : (
                /* ── Status solo ── */
                <div className="flex flex-col items-center gap-0.5">
                    <span className="font-[family-name:var(--font-orbitron)] text-[0.55rem] tracking-[0.2em] text-[#50ff8c]/55 uppercase">
                        Status
                    </span>
                    <AnimatePresence mode="wait">
                        <motion.span key={gameState.frog.state}
                            className="font-[family-name:var(--font-orbitron)] text-[0.9rem] font-bold text-white"
                            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }}>
                            {frogStateLabel[gameState.frog.state] ?? gameState.frog.state}
                        </motion.span>
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default HUD;
