import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { wsService } from './services/WebsocketService';
import type { GameState } from './types/GameTypes';

import Frog          from './components/Frog';
import Obstacle      from './components/Obstacles';
import DeathBurst    from './components/effects/DeathBurst';
import AnimatedScore from './components/hud/AnimatedScore';

import roadSprite from './sprites/tile_road.png';
import lakeSprite from './sprites/tile_water.png';

/* ── Constantes ──────────────────────────────────────────────────────────── */

const LANE_HEIGHT = 50;

const laneBgMap: Record<string, string> = {
    ROAD:  `url(${roadSprite}) repeat-x center / auto 100%`,
    RIVER: `url(${lakeSprite}) repeat-x center / auto 100%`,
    SAFE:  'linear-gradient(135deg, #1a4a1a 0%, #2d6e2d 50%, #1a4a1a 100%)',
};

const frogStateLabel: Record<string, string> = {
    LIVING: '🟢 En vie',
    DEAD:   '💀 Mort',
    WIN:    '🏆 Victoire !',
};

/* ── Types locaux ────────────────────────────────────────────────────────── */

interface DeathBurstState {
    x: number;
    y: number;
    type: 'road' | 'river';
}

/* ── Game ──────────────────────────────────────────────────────────────── */

const Game: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [scale, setScale]         = useState(1);
    const prevFrogState   = useRef<string>('LIVING');
    const [deathBurst, setDeathBurst] = useState<DeathBurstState | null>(null);

    /* ── Responsive : recalcule le scale quand la fenêtre est redimensionnée ── */
    useEffect(() => {
        const updateScale = () => {
            if (!gameState) return;
            const margin  = 32; // px de marge de chaque côté
            const maxW    = window.innerWidth  - margin * 2;
            const maxH    = window.innerHeight - 160; // réserve pour le HUD
            setScale(Math.min(1, maxW / gameState.screenWidth, maxH / gameState.screenHeight));
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [gameState?.screenWidth, gameState?.screenHeight]);

    /* ── WebSocket ──────────────────────────────────────────────────────── */
    useEffect(() => {
        wsService.connect('ws://localhost:8080');
        const unsubscribe = wsService.subscribe((data: GameState) => setGameState(data));
        return () => { unsubscribe(); wsService.disconnect(); };
    }, []);

    /* ── Détection de mort pour le burst de particules ──────────────────── */
    useEffect(() => {
        if (!gameState) return;
        const { frog, lanes } = gameState;

        if (frog.state === 'DEAD' && prevFrogState.current !== 'DEAD') {
            // Détermine si la mort est sur la rivière ou la route
            const inRiver = lanes.some(lane =>
                lane.laneType === 'RIVER' &&
                frog.y >= lane.positionY &&
                frog.y <  lane.positionY + LANE_HEIGHT
            );

            setDeathBurst({ x: frog.x, y: frog.y, type: inRiver ? 'river' : 'road' });

            // Nettoie le burst après la fin de l'animation (~1.5s)
            const t = setTimeout(() => setDeathBurst(null), 1500);
            return () => clearTimeout(t);
        }

        prevFrogState.current = frog.state;
    }, [gameState]);

    /* ── Clavier : saut discret + répétition si maintenu ───────────────── */
    useEffect(() => {
        const keyMap: Record<string, string> = {
            ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
        };

        const INITIAL_DELAY_MS   = 200;
        const REPEAT_INTERVAL_MS = 150;

        let holdTimeout:    ReturnType<typeof setTimeout>  | null = null;
        let repeatInterval: ReturnType<typeof setInterval> | null = null;

        const stopRepeat = () => {
            if (holdTimeout)    { clearTimeout(holdTimeout);    holdTimeout    = null; }
            if (repeatInterval) { clearInterval(repeatInterval); repeatInterval = null; }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const cmd = keyMap[e.key];
            if (!cmd || holdTimeout || repeatInterval) return;
            e.preventDefault();
            wsService.send(cmd);
            holdTimeout = setTimeout(() => {
                repeatInterval = setInterval(() => wsService.send(cmd), REPEAT_INTERVAL_MS);
            }, INITIAL_DELAY_MS);
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (keyMap[e.key]) stopRepeat();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup',   handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup',   handleKeyUp);
            stopRepeat();
        };
    }, []);

    /* ── Loading ──────────────────────────────────────────────────────────── */
    if (!gameState) {
        return (
            <div className="min-h-screen w-screen flex items-center justify-center"
                 style={{ background: 'radial-gradient(ellipse at top, #0d1b2a 0%, #000508 100%)' }}>
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        className="text-6xl"
                        animate={{ y: [0, -12, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
                    >
                        🐸
                    </motion.div>
                    <p className="font-[family-name:var(--font-orbitron)] text-base tracking-widest text-[#50ff8c]/70 m-0">
                        Connexion au serveur Frogger…
                    </p>
                    <div className="flex gap-2">
                        {[0, 1, 2].map(i => (
                            <motion.span
                                key={i}
                                className="w-2 h-2 rounded-full bg-[#50ff8c]"
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const isDead  = gameState.frog.state === 'DEAD';
    const isWin   = gameState.frog.state === 'WIN';
    const canvasW = gameState.screenWidth  ?? 1000;
    const canvasH = gameState.screenHeight ?? 650;

    /* ── Rendu principal ──────────────────────────────────────────────────── */
    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center gap-4 select-none"
             style={{ background: 'radial-gradient(ellipse at top, #0d1b2a 0%, #000508 100%)' }}>

            {/* ── HUD ─────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-2.5 rounded-xl border border-[#50ff8c]/25 backdrop-blur-md"
                 style={{
                     width:       canvasW * scale,
                     background:  'rgba(0,20,10,0.75)',
                     boxShadow:   '0 0 20px rgba(80,255,140,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
                 }}>

                {/* Score animé */}
                <AnimatedScore score={gameState.score} />

                {/* Titre */}
                <div className="font-[family-name:var(--font-orbitron)] text-2xl font-black tracking-[0.15em] text-[#50ff8c]"
                     style={{ textShadow: '0 0 16px rgba(80,255,140,0.6)' }}>
                    🐸 FROGGER
                </div>

                {/* Status */}
                <div className="flex flex-col items-center gap-0.5">
                    <span className="font-[family-name:var(--font-orbitron)] text-[0.55rem] tracking-[0.2em] text-[#50ff8c]/55 uppercase">
                        Status
                    </span>
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={gameState.frog.state}
                            className="font-[family-name:var(--font-orbitron)] text-[0.9rem] font-bold text-white"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{    opacity: 0, y:  6 }}
                            transition={{ duration: 0.15 }}
                        >
                            {frogStateLabel[gameState.frog.state] ?? gameState.frog.state}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Canvas : applique le scale responsive ──────────────────── */}
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
            <motion.div
                className="relative overflow-hidden rounded-lg border-2"
                style={{ width: canvasW, height: canvasH, background: '#050e08' }}
                animate={{
                    borderColor: isDead ? 'rgba(239,68,68,0.6)' : isWin ? 'rgba(250,204,21,0.7)' : 'rgba(80,255,140,0.3)',
                    boxShadow:   isDead
                        ? '0 0 0 1px #000, 0 0 50px rgba(255,60,60,0.35), 0 8px 32px #000'
                        : isWin
                        ? '0 0 0 1px #000, 0 0 60px rgba(255,215,0,0.4), 0 8px 32px #000'
                        : '0 0 0 1px #000, 0 0 40px rgba(80,255,140,0.12), 0 8px 32px #000',
                    // Shake du canvas à la mort
                    x: isDead ? [0, -6, 6, -4, 4, -2, 2, 0] : 0,
                }}
                transition={{
                    borderColor: { duration: 0.3 },
                    boxShadow:   { duration: 0.3 },
                    x:           { duration: 0.4 },
                }}
            >
                {/* Lanes + obstacles */}
                {gameState.lanes.map((lane, index) => (
                    <div
                        key={index}
                        className="absolute left-0 w-full border-b border-black/40"
                        style={{
                            top:        lane.positionY,
                            height:     LANE_HEIGHT,
                            background: laneBgMap[lane.laneType] ?? '#555',
                        }}
                    >
                        {lane.obstacles.map((obs, i) => (
                            <Obstacle key={i} data={obs} lanePositionY={lane.positionY} />
                        ))}
                    </div>
                ))}

                {/* Grenouille */}
                <Frog data={gameState.frog} />

                {/* Burst de particules à la mort */}
                {deathBurst && (
                    <DeathBurst
                        key={`${deathBurst.x}-${deathBurst.y}`}
                        x={deathBurst.x}
                        y={deathBurst.y}
                        type={deathBurst.type}
                    />
                )}

                {/* Overlay GAME OVER */}
                <AnimatePresence>
                    {isDead && (
                        <motion.div
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3"
                            style={{ background: 'radial-gradient(ellipse at center, rgba(200,0,0,0.55) 0%, rgba(0,0,0,0.8) 70%)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{    opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <motion.span
                                className="text-6xl"
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                            >
                                💀
                            </motion.span>
                            <motion.p
                                className="font-[family-name:var(--font-orbitron)] text-4xl font-black tracking-[0.2em] text-[#ff5555] m-0"
                                style={{ textShadow: '0 0 20px #ff5555, 0 2px 0 rgba(0,0,0,0.5)' }}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0,  opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                GAME OVER
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Overlay VICTORY */}
                <AnimatePresence>
                    {isWin && (
                        <motion.div
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3"
                            style={{ background: 'radial-gradient(ellipse at center, rgba(255,200,0,0.45) 0%, rgba(0,0,0,0.8) 70%)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{    opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.span
                                className="text-6xl"
                                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 1.2 }}
                            >
                                🏆
                            </motion.span>
                            <motion.p
                                className="font-[family-name:var(--font-orbitron)] text-4xl font-black tracking-[0.2em] text-[#ffd700] m-0"
                                style={{ textShadow: '0 0 20px #ffd700, 0 2px 0 rgba(0,0,0,0.5)' }}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0,  opacity: 1 }}
                                transition={{ delay: 0.15 }}
                            >
                                VICTORY!
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            </div> {/* fin wrapper scale */}

            {/* ── Controls hint ───────────────────────────────────────────── */}
            <p className="text-xs text-white/30 tracking-wide m-0">
                <span className="font-[family-name:var(--font-orbitron)] text-[#50ff8c]/50 text-sm mr-1">↑ ↓ ← →</span>
                pour déplacer la grenouille
            </p>
        </div>
    );
};

export default Game;