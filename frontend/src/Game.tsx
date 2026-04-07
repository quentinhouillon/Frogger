import React from 'react';
import { motion } from 'framer-motion';
import { useGameLogic } from './hooks/useGameLogic';

import LoadingScreen from './components/screens/LoadingScreen';
import HUD           from './components/hud/HUD';
import { GameOverOverlay, VictoryOverlay } from './components/overlays/GameOverlays';
import Frog          from './components/Frog';
import Obstacle      from './components/Obstacles';
import DeathBurst    from './components/effects/DeathBurst';

import roadSprite from './sprites/tile_road.png';
import lakeSprite from './sprites/tile_water.png';
import bushSprite from './sprites/tile_bush.png';

const LANE_HEIGHT = 50;
const laneBgMap: Record<string, string> = {
    ROAD:  `url(${roadSprite}) repeat-x center / auto 100%`,
    RIVER: `url(${lakeSprite}) repeat-x center / auto 100%`,
    SAFE:  'linear-gradient(135deg, #1a4a1a 0%, #2d6e2d 50%, #1a4a1a 100%)',
    WATERLITY_BUSH: `url(${bushSprite}) repeat-x center / auto 100%`,
};

const Game: React.FC = () => {
    // 1. Toute la logique métier est encapulsée dans le hook
    const { gameState, scale, deathBurst } = useGameLogic();

    // 2. Écran de chargement si pas de données
    if (!gameState) return <LoadingScreen />;

    // 3. Dérivation des états visuels
    const isDead  = gameState.frog.state === 'DEAD';
    const isWin   = gameState.frog.state === 'WIN';
    const canvasW = gameState.screenWidth  ?? 1000;
    const canvasH = gameState.screenHeight ?? 650;

    // 4. Rendu de l'écran principal
    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center gap-4 select-none"
             style={{ background: 'radial-gradient(ellipse at top, #0d1b2a 0%, #000508 100%)' }}>

            <HUD gameState={gameState} canvasW={canvasW} scale={scale} />

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
                        x: isDead ? [0, -6, 6, -4, 4, -2, 2, 0] : 0,
                    }}
                    transition={{ duration: 0.3 }}
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

                    <Frog data={gameState.frog} />

                    {deathBurst && (
                        <DeathBurst key={`${deathBurst.x}-${deathBurst.y}`} {...deathBurst} />
                    )}

                    <GameOverOverlay isVisible={isDead} />
                    <VictoryOverlay  isVisible={isWin} />

                </motion.div>
            </div>

            <p className="text-xs text-white/30 tracking-wide m-0">
                <span className="font-[family-name:var(--font-orbitron)] text-[#50ff8c]/50 text-sm mr-1">↑ ↓ ← →</span>
                pour déplacer la grenouille
            </p>
        </div>
    );
};

export default Game;