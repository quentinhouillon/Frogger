import React from 'react';
import { motion } from 'framer-motion';
import { useGameLogic } from './hooks/useGameLogic';
import type { GameSettings } from './types/GameTypes';

import LoadingScreen from './components/screens/LoadingScreen';
import HUD           from './components/hud/HUD';
import { GameOverOverlay, VictoryOverlay } from './components/overlays/GameOverlays';
import FrogComponent from './components/Frog';
import Obstacle      from './components/Obstacles';
import DeathBurst    from './components/effects/DeathBurst';

import roadSprite    from './sprites/tile_road.png';
import lakeSprite    from './sprites/tile_water.png';
import bushSprite    from './sprites/tile_bush.png';
import nenupharSprite from './sprites/tile_nenuphar_bush.png';

const LANE_HEIGHT = 50;
const laneBgMap: Record<string, string> = {
    ROAD:           `url(${roadSprite}) repeat-x center / auto 100%`,
    RIVER:          `url(${lakeSprite}) repeat-x center / auto 100%`,
    SAFE:           'linear-gradient(135deg, #1a4a1a 0%, #2d6e2d 50%, #1a4a1a 100%)',
    WATERLITY_BUSH: `url(${bushSprite}) repeat-x center / auto 100%`,
};

interface GameProps {
    settings:      GameSettings;
    onBackToMenu:  () => void;
}

const Game: React.FC<GameProps> = ({ settings, onBackToMenu }) => {
    const { gameState, scale, deathBurst, resetGame } = useGameLogic(settings);

    if (!gameState) return <LoadingScreen />;

    const isDead  = gameState.gameOver;
    const isWin   = gameState.gameWon;
    const canvasW = gameState.screenWidth  ?? 1000;
    const canvasH = gameState.screenHeight ?? 650;

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

                    {/* Lily slots : fond buisson + nénuphar sur les emplacements */}
                    {gameState.lilySlots?.map((slot, i) => (
                        <motion.div
                            key={i}
                            style={{
                                position:           'absolute',
                                left:               slot.x,
                                top:                slot.y,
                                width:              slot.width + 20, // légèrement plus large visuellement
                                height:             slot.height,
                                marginLeft:         -10,
                                backgroundImage:    `url(${nenupharSprite})`,
                                backgroundSize:     'contain',
                                backgroundRepeat:   'no-repeat',
                                backgroundPosition: 'center',
                                zIndex:             5,
                                opacity:            slot.occupied ? 0.5 : 1,
                            }}
                            animate={slot.occupied ? { scale: [1, 1.15, 1] } : {}}
                            transition={{ duration: 0.3 }}
                        />
                    ))}

                    {/* Grenouilles garées sur les slots */}
                    {gameState.parkedFrogs?.map((pf, i) => (
                        <FrogComponent key={`parked-${i}`} data={pf} />
                    ))}

                    <FrogComponent data={gameState.frog} />

                    {deathBurst && (
                        <DeathBurst key={`${deathBurst.x}-${deathBurst.y}`} {...deathBurst} />
                    )}

                    <GameOverOverlay isVisible={isDead} onReset={resetGame} onMenu={onBackToMenu} highScores={gameState.highScores} />
                    <VictoryOverlay  isVisible={isWin}  onReset={resetGame} onMenu={onBackToMenu} highScores={gameState.highScores} />

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