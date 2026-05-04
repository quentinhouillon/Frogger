import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { HighScoreEntry } from '../../types/GameTypes';

interface OverlayProps {
    isVisible:   boolean;
    onReset?:    () => void;
    onMenu?:     () => void;
    highScores?: HighScoreEntry[];
    winner?:     number; // 0=solo/aucun, 1=J1, 2=J2
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

const ScoreTable: React.FC<{ entries: HighScoreEntry[]; theme: OverlayTheme }> = ({ entries, theme }) => (
    <motion.div className="mt-1 w-full"
        initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
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

const OverlayCard: React.FC<OverlayProps & { theme: OverlayTheme }> = ({ isVisible, onReset, onMenu, highScores, theme }) => (
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

                    <div className="mb-5 flex items-start justify-between gap-4">
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

                    <div className="mb-5 rounded-xl border px-3 py-2"
                        style={{ borderColor: theme.borderColor, background: 'rgba(9,24,14,0.55)' }}>
                        <p className="m-0 text-sm" style={{ color: theme.accentSoft }}>{theme.subtitle}</p>
                    </div>

                    {highScores && highScores.length > 0 && <ScoreTable entries={highScores} theme={theme} />}

                    <motion.div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
                        initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
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

export const GameOverOverlay: React.FC<OverlayProps> = (props) => (
    <OverlayCard {...props} theme={loseTheme} />
);

export const VictoryOverlay: React.FC<OverlayProps> = ({ winner, ...props }) => {
    // En mode multijoueur, le titre indique quel joueur a gagné
    const theme: OverlayTheme = {
        ...winTheme,
        title: winner === 1 ? 'Joueur 1 gagne !'
             : winner === 2 ? 'Joueur 2 gagne !'
             : winTheme.title,
    };
    return <OverlayCard {...props} winner={winner} theme={theme} />;
};
