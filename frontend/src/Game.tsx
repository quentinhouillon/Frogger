import React, { useEffect, useState } from 'react';
import { wsService } from './services/WebsocketService';
import type { GameState } from './types/GameTypes';
import Frog from './components/Frog';
import Obstacle from './components/Obstacles';
import PauseMenu from './components/PauseMenu';


import roadSprite from './sprites/tile_road.png';
import lakeSprite from './sprites/tile_water.png';



const laneBgMap: Record<string, string> = {
    ROAD:  `url(${roadSprite}) repeat-x center / auto 100%`,
    RIVER: `url(${lakeSprite}) repeat-x center / auto 100%`,
    SAFE:  'linear-gradient(135deg, #1a4a1a 0%, #2d6e2d 50%, #1a4a1a 100%)',
};

const frogStateLabel: Record<string, string> = {
    LIVING: '🟢 En vie',
    MOVING: '🔵 En mouvement',
    DEAD:   '💀 Mort',
    WIN:    '🏆 Victoire !',
};

/* ── Game ─────────────────────────────────────────── */
const Game: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);

    useEffect(() => {
        wsService.connect('ws://localhost:8080');
        const unsubscribe = wsService.subscribe((data: GameState) => setGameState(data));
        return () => { unsubscribe(); wsService.disconnect(); };
    }, []);

    useEffect(() => {
        const keyMap: Record<string, string> = {
            ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
        };

        // Délai avant que la répétition démarre (ms)
        const INITIAL_DELAY_MS  = 200;
        // Intervalle entre chaque saut répété (ms)
        const REPEAT_INTERVAL_MS = 150;

        let holdTimeout:    ReturnType<typeof setTimeout>  | null = null;
        let repeatInterval: ReturnType<typeof setInterval> | null = null;

        const stopRepeat = () => {
            if (holdTimeout)    { clearTimeout(holdTimeout);   holdTimeout = null; }
            if (repeatInterval) { clearInterval(repeatInterval); repeatInterval = null; }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const cmd = keyMap[e.key];
            if (!cmd) return;
            e.preventDefault();

            // Si une répétition est déjà en cours, on ignore (une seule direction à la fois)
            if (holdTimeout || repeatInterval) return;

            // 1. Saut immédiat
            wsService.send(cmd);

            // 2. Après le délai initial, sauts répétés tant que la touche est tenue
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

    /* ── Loading ────────────────────────────────────── */
    if (!gameState) {
        return (
            <div className="min-h-screen w-screen flex items-center justify-center"
                 style={{ background: 'radial-gradient(ellipse at top, #0d1b2a 0%, #000508 100%)' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="text-6xl animate-frog-bounce">🐸</div>
                    <p className="font-[family-name:var(--font-orbitron)] text-base tracking-widest text-[#50ff8c]/70 animate-flicker m-0">
                        Connexion au serveur Frogger…
                    </p>
                    <div className="flex gap-2">
                        {[0, 1, 2].map(i => (
                            <span key={i}
                                  className={`w-2 h-2 rounded-full bg-[#50ff8c] animate-dot-pulse ${i === 1 ? 'dot-delay-1' : i === 2 ? 'dot-delay-2' : ''}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const isDead = gameState.frog.state === 'DEAD';
    const isWin  = gameState.frog.state === 'WIN';
    // Fallback to 600 in case backend doesn't yet send these fields
    const canvasW = gameState.screenWidth  ?? 600;
    const canvasH = gameState.screenHeight ?? 600;

    return (
        /* ── Wrapper ──────────────────────────────────── */
        <div className="min-h-screen w-screen flex flex-col items-center justify-center gap-4 select-none"
             style={{ background: 'radial-gradient(ellipse at top, #0d1b2a 0%, #000508 100%)' }}>

            {/* ── HUD ──────────────────────────────────────── */}
            <div className="flex items-center justify-between w-full px-5 py-2.5 rounded-xl border border-[#50ff8c]/25 backdrop-blur-md"
                 style={{
                     background: 'rgba(0,20,10,0.75)',
                     boxShadow: '0 0 20px rgba(80,255,140,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
                     maxWidth: canvasW,
                 }}>

                {/* Score */}
                <div className="flex flex-col items-center gap-0.5">
                    <span className="font-[family-name:var(--font-orbitron)] text-[0.55rem] tracking-[0.2em] text-[#50ff8c]/55 uppercase">
                        Score
                    </span>
                    <span className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white text-shadow-glow">
                        {gameState.score}
                    </span>
                </div>

                {/* Title */}
                <div className="font-[family-name:var(--font-orbitron)] text-2xl font-black tracking-[0.15em] text-[#50ff8c] text-shadow-accent">
                    🐸 FROGGER
                </div>

                {/* Status */}
                <div className="flex flex-col items-center gap-0.5">
                    <span className="font-[family-name:var(--font-orbitron)] text-[0.55rem] tracking-[0.2em] text-[#50ff8c]/55 uppercase">
                        Status
                    </span>
                    <span className="font-[family-name:var(--font-orbitron)] text-[0.9rem] font-bold text-white text-shadow-glow">
                        {frogStateLabel[gameState.frog.state] ?? gameState.frog.state}
                    </span>
                </div>
            </div>

            {/* ── Canvas ───────────────────────────────────── */}
            <div
                className={[
                    'relative overflow-hidden rounded-lg border-2 transition-shadow duration-400',
                    isDead ? 'border-red-500/60 animate-shake' : isWin ? 'border-yellow-400/70' : 'border-[#50ff8c]/30',
                ].join(' ')}
                style={{
                    width:  canvasW,
                    height: canvasH,
                    background: '#050e08',
                    boxShadow: isDead
                        ? '0 0 0 1px #000, 0 0 50px rgba(255,60,60,0.35), 0 8px 32px #000'
                        : isWin
                        ? '0 0 0 1px #000, 0 0 60px rgba(255,215,0,0.4), 0 8px 32px #000'
                        : '0 0 0 1px #000, 0 0 40px rgba(80,255,140,0.12), 0 8px 32px #000',
                }}
            >
                {/* Overlay GAME OVER */}
                {isDead && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 animate-overlay-in"
                         style={{ background: 'radial-gradient(ellipse at center, rgba(200,0,0,0.55) 0%, rgba(0,0,0,0.8) 70%)' }}>
                        <span className="text-6xl animate-pulse-icon">💀</span>
                        <p className="font-[family-name:var(--font-orbitron)] text-4xl font-black tracking-[0.2em] text-[#ff5555] m-0"
                           style={{ textShadow: '0 0 20px #ff5555, 0 2px 0 rgba(0,0,0,0.5)' }}>
                            GAME OVER
                        </p>
                    </div>
                )}

                {/* Overlay VICTORY */}
                {isWin && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 animate-overlay-in"
                         style={{ background: 'radial-gradient(ellipse at center, rgba(255,200,0,0.45) 0%, rgba(0,0,0,0.8) 70%)' }}>
                        <span className="text-6xl animate-pulse-icon">🏆</span>
                        <p className="font-[family-name:var(--font-orbitron)] text-4xl font-black tracking-[0.2em] text-[#ffd700] m-0"
                           style={{ textShadow: '0 0 20px #ffd700, 0 2px 0 rgba(0,0,0,0.5)' }}>
                            VICTORY!
                        </p>
                    </div>
                )}

                {/* Lanes */}
                {gameState.lanes.map((lane, index) => (
                    <div
                        key={index}
                        className="absolute left-0 w-full border-b border-black/40"
                        style={{
                            top:        lane.positionY,
                            height:     50,
                            background: laneBgMap[lane.laneType] ?? '#a38282ff',
                        }}
                    >
                        {lane.obstacles.map((obs, i) => (
                            <Obstacle key={i} data={obs} lanePositionY={lane.positionY} />
                        ))}
                    </div>
                ))}

                {/* Frog */}
                <Frog data={gameState.frog} />
            </div>

            {/* ── Controls hint ──────────────────────────── */}
            <p className="text-xs text-white/30 tracking-wide m-0">
                <span className="font-[family-name:var(--font-orbitron)] text-[#50ff8c]/50 text-sm mr-1">↑ ↓ ← →</span>
                pour déplacer la grenouille
            </p>
        </div>
    );
};

export default Game;