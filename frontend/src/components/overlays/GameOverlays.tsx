import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { HighScoreEntry, ScoreBreakdown } from '../../types/GameTypes';

interface OverlayProps {
    isVisible:      boolean;
    onReset?:       () => void;
    onMenu?:        () => void;
    highScores?:    HighScoreEntry[];
    winner?:        number;
    breakdown?:     ScoreBreakdown | null;
    breakdown2?:    ScoreBreakdown | null;
}

interface OverlayTheme {
    accent:            string;
    accentSoft:        string;
    borderColor:       string;
    title:             string;
    subtitle:          string;
    icon:              string;
    overlayBackground: string;
    glow:              string;
    scoreDateColor:    string;
    scoreChipBg:       string;
    primaryBtnBg:      string;
    primaryBtnBorder:  string;
    primaryBtnText:    string;
}

// ── Tableau des meilleurs scores ──────────────────────────────────────────────
const ScoreTable: React.FC<{ entries: HighScoreEntry[]; theme: OverlayTheme }> = ({ entries, theme }) => (
    <motion.div className="mt-1 w-full"
        initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        <p className="mb-2 text-center font-[family-name:var(--font-orbitron)] text-[0.62rem] uppercase tracking-[0.22em]"
            style={{ color: theme.accentSoft }}>
            Meilleurs scores
        </p>
        {entries.map((entry, i) => (
            <div key={i}
                className="mb-1 flex items-center justify-between rounded px-2 py-1 text-xs font-mono"
                style={{ background: i % 2 === 0 ? theme.scoreChipBg : 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.85)' }}>
                <span style={{ color: theme.accent }}>#{i + 1}</span>
                <span className="font-bold">{entry.score}</span>
                <span style={{ color: theme.scoreDateColor }}>{entry.date}</span>
            </div>
        ))}
    </motion.div>
);

// ── Récapitulatif des points ──────────────────────────────────────────────────
interface BreakdownRowProps {
    label:    string;
    value:    number;
    emoji:    string;
    color:    string;
    negative?: boolean;
    delay:    number;
}

const BreakdownRow: React.FC<BreakdownRowProps> = ({ label, value, emoji, color, negative, delay }) => {
    if (value === 0) return null;
    return (
        <motion.div
            className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs"
            style={{ background: `${color}14`, border: `1px solid ${color}30` }}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay }}
        >
            <span className="flex items-center gap-1.5 text-white/70">
                <span>{emoji}</span>
                <span className="font-[family-name:var(--font-orbitron)] text-[0.6rem] tracking-widest uppercase">
                    {label}
                </span>
            </span>
            <span
                className="font-[family-name:var(--font-orbitron)] text-[0.75rem] font-black tabular-nums"
                style={{ color, textShadow: `0 0 8px ${color}66` }}
            >
                {negative ? '−' : '+'}{value}
            </span>
        </motion.div>
    );
};

const ScoreBreakdownPanel: React.FC<{ breakdown: ScoreBreakdown; theme: OverlayTheme; label?: string }> = ({ breakdown, theme, label }) => (
    <motion.div className="mt-3 w-full"
        initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>

        <p className="mb-2 text-center font-[family-name:var(--font-orbitron)] text-[0.62rem] uppercase tracking-[0.22em]"
            style={{ color: theme.accentSoft }}>
            {label ?? 'Récap des points'}
        </p>

        <div className="flex flex-col gap-1.5">
            <BreakdownRow emoji="🐸" label="Progression" value={breakdown.lanePoints}   color="#50ff8c" delay={0.18} />
            <BreakdownRow emoji="🏁" label="Arrivées"    value={breakdown.arrivalPoints} color="#ffe48d" delay={0.22} />
            <BreakdownRow emoji="⏱️" label="Bonus temps"  value={breakdown.timePoints}    color="#80cfff" delay={0.26} />
            <BreakdownRow emoji="❤️" label="Bonus vies"  value={breakdown.livesPoints}   color="#ff6b9d" delay={0.30} />
            {breakdown.deathPenalty > 0 && (
                <BreakdownRow emoji="💀" label={`Pénalités (×${breakdown.deaths})`}
                    value={breakdown.deathPenalty} color="#ff5555" negative delay={0.34} />
            )}
        </div>

        {/* Ligne totale */}
        <motion.div
            className="mt-2 flex items-center justify-between rounded-lg border px-3 py-2"
            style={{ borderColor: theme.borderColor, background: `${theme.accent}18` }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.38 }}
        >
            <span className="font-[family-name:var(--font-orbitron)] text-[0.65rem] uppercase tracking-widest"
                style={{ color: theme.accentSoft }}>
                Total
            </span>
            <span className="font-[family-name:var(--font-orbitron)] text-lg font-black tabular-nums"
                style={{ color: theme.accent, textShadow: `0 0 12px ${theme.accent}66` }}>
                {breakdown.total}
            </span>
        </motion.div>
    </motion.div>
);

// ── Carte d'overlay principale ────────────────────────────────────────────────
const OverlayCard: React.FC<OverlayProps & { theme: OverlayTheme }> = ({
    isVisible, onReset, onMenu, highScores, breakdown, breakdown2, theme,
}) => {
    const [tab, setTab] = useState<'recap' | 'scores'>('recap');
    const hasBreakdown  = breakdown && (breakdown.lanePoints + breakdown.arrivalPoints + breakdown.timePoints + breakdown.livesPoints + breakdown.deathPenalty) > 0;
    const hasBoth       = hasBreakdown && breakdown2 && (breakdown2.lanePoints + breakdown2.arrivalPoints + breakdown2.timePoints + breakdown2.livesPoints + breakdown2.deathPenalty) > 0;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="absolute inset-0 z-50 flex items-center justify-center px-4"
                    style={{ background: theme.overlayBackground, backdropFilter: 'blur(5px)' }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}>
                    <motion.div
                        className="relative w-full max-w-md overflow-hidden rounded-2xl border p-6 text-white"
                        style={{
                            borderColor: theme.borderColor,
                            background: 'linear-gradient(165deg, rgba(5,18,11,0.97) 0%, rgba(6,10,7,0.97) 100%)',
                            boxShadow: `0 0 0 1px rgba(15,24,16,0.9), 0 0 50px ${theme.glow}, 0 20px 60px rgba(0,0,0,0.75)`,
                        }}
                        initial={{ y: 12, opacity: 0, scale: 0.98 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 8, opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}>

                        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full"
                            style={{ background: `radial-gradient(circle, ${theme.glow}, rgba(0,0,0,0))` }} />

                        {/* En-tête */}
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <p className="m-0 text-xs uppercase tracking-[0.25em]" style={{ color: theme.accentSoft }}>Frogger</p>
                                <h1 className="m-0 text-3xl font-semibold tracking-wide" style={{ color: theme.accent }}>{theme.title}</h1>
                            </div>
                            <motion.span className="text-4xl"
                                animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.1 }}
                                aria-hidden="true">
                                {theme.icon}
                            </motion.span>
                        </div>

                        <div className="mb-4 rounded-xl border px-3 py-2"
                            style={{ borderColor: theme.borderColor, background: 'rgba(9,24,14,0.55)' }}>
                            <p className="m-0 text-sm" style={{ color: theme.accentSoft }}>{theme.subtitle}</p>
                        </div>

                        {/* Onglets Récap / Scores */}
                        {hasBreakdown && (
                            <div className="mb-3 flex gap-1 rounded-lg p-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                {(['recap', 'scores'] as const).map(t => (
                                    <button key={t} onClick={() => setTab(t)}
                                        className="flex-1 rounded-md py-1 text-[0.65rem] font-black uppercase tracking-widest transition cursor-pointer font-[family-name:var(--font-orbitron)]"
                                        style={{
                                            background:  tab === t ? theme.scoreChipBg : 'transparent',
                                            color:       tab === t ? theme.accent : 'rgba(255,255,255,0.4)',
                                            border:      tab === t ? `1px solid ${theme.borderColor}` : '1px solid transparent',
                                        }}>
                                        {t === 'recap' ? '📊 Récap' : '🏆 Scores'}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Contenu onglet */}
                        <AnimatePresence mode="wait">
                            {tab === 'recap' && hasBreakdown ? (
                                <motion.div key="recap"
                                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                                    <ScoreBreakdownPanel breakdown={breakdown!} theme={theme}
                                        label={hasBoth ? 'Récap — Joueur 1' : 'Récap des points'} />
                                    {hasBoth && (
                                        <ScoreBreakdownPanel breakdown={breakdown2!} theme={theme}
                                            label="Récap — Joueur 2" />
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div key="scores"
                                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                                    {highScores && highScores.length > 0
                                        ? <ScoreTable entries={highScores} theme={theme} />
                                        : <p className="text-center text-xs text-white/30 mt-4">Aucun score enregistré</p>
                                    }
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Boutons */}
                        <motion.div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
                            initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
                            {onReset && (
                                <button onClick={onReset}
                                    className="rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:scale-[1.02] cursor-pointer"
                                    style={{ borderColor: theme.primaryBtnBorder, background: theme.primaryBtnBg, color: theme.primaryBtnText }}>
                                    Rejouer
                                </button>
                            )}
                            {onMenu && (
                                <button onClick={onMenu}
                                    className="rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:scale-[1.02] cursor-pointer"
                                    style={{ borderColor: 'rgba(140,219,255,0.44)', background: 'linear-gradient(180deg, rgba(140,219,255,0.16), rgba(35,73,96,0.35))', color: '#daf2ff' }}>
                                    Menu
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ── Thèmes ────────────────────────────────────────────────────────────────────
const loseTheme: OverlayTheme = {
    accent:            '#ffb6b6',
    accentSoft:        '#ffcaca',
    borderColor:       'rgba(255,116,116,0.4)',
    title:             'Game Over',
    subtitle:          'La grenouille a coulé. Respire et repars pour un nouveau run.',
    icon:              '💀',
    overlayBackground: 'radial-gradient(circle at top, rgba(255,80,80,0.14) 0%, rgba(20,5,5,0.88) 40%, rgba(0,0,0,0.92) 100%)',
    glow:              'rgba(255,80,80,0.25)',
    scoreDateColor:    'rgba(255,220,220,0.55)',
    scoreChipBg:       'rgba(255,80,80,0.12)',
    primaryBtnBg:      'linear-gradient(180deg, rgba(255,120,120,0.3), rgba(122,34,34,0.5))',
    primaryBtnBorder:  'rgba(255,140,140,0.55)',
    primaryBtnText:    '#ffecec',
};

const winTheme: OverlayTheme = {
    accent:            '#ffe48d',
    accentSoft:        '#ffefba',
    borderColor:       'rgba(255,214,96,0.42)',
    title:             'Victory',
    subtitle:          'Bravo. Tu as sécurisé la traversée, continue sur cette lancée.',
    icon:              '🏆',
    overlayBackground: 'radial-gradient(circle at top, rgba(255,214,96,0.15) 0%, rgba(20,14,2,0.88) 40%, rgba(0,0,0,0.92) 100%)',
    glow:              'rgba(255,214,96,0.26)',
    scoreDateColor:    'rgba(255,243,202,0.58)',
    scoreChipBg:       'rgba(255,214,96,0.12)',
    primaryBtnBg:      'linear-gradient(180deg, rgba(255,219,92,0.28), rgba(122,93,18,0.45))',
    primaryBtnBorder:  'rgba(255,219,92,0.56)',
    primaryBtnText:    '#fff6d1',
};

// ── Exports ───────────────────────────────────────────────────────────────────
export const GameOverOverlay: React.FC<OverlayProps> = (props) => (
    <OverlayCard {...props} theme={loseTheme} />
);

export const VictoryOverlay: React.FC<OverlayProps> = ({ winner, ...props }) => {
    const theme: OverlayTheme = {
        ...winTheme,
        title: winner === 1 ? 'Joueur 1 gagne !'
             : winner === 2 ? 'Joueur 2 gagne !'
             : winTheme.title,
    };
    return <OverlayCard {...props} winner={winner} theme={theme} />;
};
