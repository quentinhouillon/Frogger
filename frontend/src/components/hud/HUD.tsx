import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedScore from './AnimatedScore';
import type { GameState } from '../../types/GameTypes';

interface HUDProps {
    gameState: GameState;
    canvasW:   number;
    scale:     number;
}

const TIME_LIMIT = 30; // doit correspondre à ScoreManager.TIME_LIMIT

const frogStateLabel: Record<string, string> = {
    LIVING: '🟢 En vie',
    DEAD:   '💀 Mort',
    WIN:    '🏆 Victoire !',
};

/** Badge de combo — s'allume dès 2 arrivées consécutives sans mort */
const ComboTag: React.FC<{ combo: number }> = ({ combo }) => {
    if (combo < 2) return null;
    return (
        <motion.span
            key={combo}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            className="font-[family-name:var(--font-orbitron)] text-[0.55rem] font-black tracking-widest px-1.5 py-0.5 rounded"
            style={{
                background:  'rgba(255,210,50,0.15)',
                color:       '#ffd232',
                border:      '1px solid rgba(255,210,50,0.4)',
                textShadow: '0 0 8px rgba(255,210,50,0.7)',
            }}
        >
            🔥 x{combo} COMBO
        </motion.span>
    );
};

/**
 * Barre de timer circulaire (arc SVG) + valeur numérique.
 * Passe du vert → orange → rouge selon le temps restant.
 */
const TimerBar: React.FC<{ timeLeft: number; color?: string }> = ({ timeLeft, color = '#50ff8c' }) => {
    const pct      = Math.max(0, Math.min(1, timeLeft / TIME_LIMIT));
    const secs     = Math.ceil(timeLeft);
    const isUrgent = timeLeft <= 8;
    const isCrit   = timeLeft <= 4;

    // Couleur dégradée selon urgence
    const barColor = isCrit   ? '#ff4444'
                   : isUrgent ? '#ff9900'
                   : color;

    // SVG arc : rayon 14, circumference ≈ 88
    const R   = 14;
    const C   = 2 * Math.PI * R;
    const off = C * (1 - pct);

    return (
        <div className="flex flex-col items-center gap-0.5">
            <span
                className="font-[family-name:var(--font-orbitron)] text-[0.5rem] tracking-[0.2em] uppercase"
                style={{ color: `${barColor}99` }}
            >
                TEMPS
            </span>

            <div className="relative w-9 h-9 flex items-center justify-center">
                {/* Piste de fond */}
                <svg className="absolute inset-0" width="36" height="36" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r={R}
                        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                    <motion.circle cx="18" cy="18" r={R}
                        fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke={barColor}
                        strokeDasharray={C}
                        strokeDashoffset={off}
                        transform="rotate(-90 18 18)"
                        animate={{ strokeDashoffset: off, stroke: barColor }}
                        transition={{ duration: 0.25, ease: 'linear' }}
                        style={{ filter: `drop-shadow(0 0 4px ${barColor}88)` }}
                    />
                </svg>

                {/* Valeur numérique centrale */}
                <AnimatePresence mode="popLayout">
                    <motion.span
                        key={secs}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{
                            opacity: 1, scale: isCrit ? [1, 1.25, 1] : 1,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: isCrit ? 0.4 : 0.15 }}
                        className="font-[family-name:var(--font-orbitron)] text-[0.7rem] font-black"
                        style={{ color: barColor, textShadow: `0 0 6px ${barColor}88`, zIndex: 1 }}
                    >
                        {secs}
                    </motion.span>
                </AnimatePresence>
            </div>
        </div>
    );
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
    const isMulti  = gameState.multiplayerMode;
    const timeLeft  = gameState.timeLeft  ?? TIME_LIMIT;
    const timeLeft2 = gameState.timeLeft2 ?? TIME_LIMIT;

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
                <ComboTag combo={gameState.combo ?? 0} />
            </div>

            {/* ── J1 vies ── */}
            <div className="flex flex-col items-center gap-0.5">
                <span className="font-[family-name:var(--font-orbitron)] text-[0.55rem] tracking-[0.2em] text-[#50ff8c]/55 uppercase">
                    {isMulti ? 'Vies J1' : 'Vies'}
                </span>
                <Lives count={gameState.lifes ?? 3} max={gameState.maxLifes ?? 3} />
            </div>

            {/* ── Timer J1 ── */}
            <TimerBar timeLeft={timeLeft} color="#50ff8c" />

            {/* ── Titre ── */}
            <div className="font-[family-name:var(--font-orbitron)] text-2xl font-black tracking-[0.15em] text-[#50ff8c]"
                 style={{ textShadow: '0 0 16px rgba(80,255,140,0.6)' }}>
                🐸 FROGGER
            </div>

            {isMulti ? (
                <>
                    {/* ── Timer J2 ── */}
                    <TimerBar timeLeft={timeLeft2} color="#ff8c50" />

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
                        <ComboTag combo={gameState.combo2 ?? 0} />
                    </div>
                </>
            ) : (
                /* ── Status + combo solo ── */
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
                    <ComboTag combo={gameState.combo ?? 0} />
                </div>
            )}
        </div>
    );
};

export default HUD;
