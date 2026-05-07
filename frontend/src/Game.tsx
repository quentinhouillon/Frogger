import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameLogic } from './hooks/useGameLogic';
import { wsService } from './services/WebsocketService';
import soundManager from './services/SoundService';
import type { GameSettings } from './types/GameTypes';

import LoadingScreen from './components/screens/LoadingScreen';
import WaitingScreen from './components/screens/WaitingScreen';
import HUD           from './components/hud/HUD';
import PauseMenu     from './components/pauseMenu/PauseMenu';
import { GameOverOverlay, VictoryOverlay } from './components/overlays/GameOverlays';
import FrogComponent from './components/Frog';
import Obstacle      from './components/Obstacles';
import DeathBurst    from './components/effects/DeathBurst';
import WaterRipple   from './components/effects/WaterRipple';

import roadSprite     from './sprites/tile_road.png';
import lakeSprite     from './sprites/tile_water.png';
import bushSprite     from './sprites/tile_bush.png';
import nenupharSprite from './sprites/tile_nenuphar_bush.png';

const LANE_HEIGHT = 50;
const laneBgMap: Record<string, string> = {
    ROAD:           `url(${roadSprite}) repeat-x center / auto 100%`,
    RIVER:          `url(${lakeSprite}) repeat-x center / auto 100%`,
    SAFE:           'linear-gradient(135deg, #1a4a1a 0%, #2d6e2d 50%, #1a4a1a 100%)',
    WATERLITY_BUSH: `url(${bushSprite}) repeat-x center / auto 100%`,
};

interface GameProps {
    settings:     GameSettings;
    onBackToMenu: () => void;
}

const Game: React.FC<GameProps> = ({ settings, onBackToMenu }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [gameSettings, setGameSettings] = useState(settings);
    const { gameState, scale, deathBurst, resetGame, myPlayerNumber, opponentLeft } =
        useGameLogic(gameSettings, isPaused);

    // Retour au menu si l'adversaire se déconnecte en mode réseau
    useEffect(() => {
        if (opponentLeft) onBackToMenu();
    }, [opponentLeft, onBackToMenu]);

    // Mets à jour le volume des effets sonores quand les paramètres changent (ne touche plus la musique)
    useEffect(() => {
        soundManager.setSfxVolume(gameSettings.sfxVolume);
    }, [gameSettings.sfxVolume]);

    // Touche Escape pour pause / reprise
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !e.repeat) {
                e.preventDefault();
                setIsPaused(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Arr\u00eate la musique quand le jeu finit
    useEffect(() => {
        if (gameState?.gameOver || gameState?.gameWon) {
            soundManager.stopSound('soundtrack');
        }
    }, [gameState?.gameOver, gameState?.gameWon]);

    // Notifie le serveur du changement de pause
    useEffect(() => {
        wsService.send(isPaused ? 'PAUSE' : 'RESUME');
    }, [isPaused]);

    const handleResume     = () => setIsPaused(false);
    const handleRestart    = () => { setIsPaused(false); resetGame(); };
    const handleBackToMenu = () => { setIsPaused(false); onBackToMenu(); };

    if (!gameState) return <LoadingScreen />;

    // Écran d'attente réseau — affiché seul, sans le canvas de jeu derrière
    if (gameState.waitingForPlayer2) {
        return (
            <div className="min-h-screen w-screen flex flex-col items-center justify-center select-none"
                 style={{ background: 'radial-gradient(ellipse at top, #0d1b2a 0%, #000508 100%)' }}>
                <WaitingScreen onBack={handleBackToMenu} />
            </div>
        );
    }

    const isDead  = gameState.gameOver;
    const isWin   = gameState.gameWon;
    const isMulti = gameState.multiplayerMode;
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
                        <div key={index}
                            className="absolute left-0 w-full border-b border-black/40"
                            style={{ top: lane.positionY, height: LANE_HEIGHT, background: laneBgMap[lane.laneType] ?? '#555' }}>
                            {lane.obstacles.map((obs, i) => (
                                <Obstacle key={i} data={obs} lanePositionY={lane.positionY} />
                            ))}
                        </div>
                    ))}

                    {/* Slots J1 — vert */}
                    {gameState.lilySlots?.map((slot, i) => (
                        <motion.div key={`s1-${i}`}
                            style={{
                                position:           'absolute',
                                left:               slot.x,
                                top:                slot.y,
                                width:              slot.width + 20,
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

                    {/* Slots J2 — teinte bleue (multijoueur) */}
                    {isMulti && gameState.lilySlots2?.map((slot, i) => (
                        <motion.div key={`s2-${i}`}
                            style={{
                                position:           'absolute',
                                left:               slot.x,
                                top:                slot.y,
                                width:              slot.width + 20,
                                height:             slot.height,
                                marginLeft:         -10,
                                backgroundImage:    `url(${nenupharSprite})`,
                                backgroundSize:     'contain',
                                backgroundRepeat:   'no-repeat',
                                backgroundPosition: 'center',
                                zIndex:             5,
                                opacity:            slot.occupied ? 0.5 : 1,
                                filter:             'hue-rotate(200deg) saturate(1.4)',
                            }}
                            animate={slot.occupied ? { scale: [1, 1.15, 1] } : {}}
                            transition={{ duration: 0.3 }}
                        />
                    ))}

                    {/* Grenouilles garées J1 */}
                    {gameState.parkedFrogs?.map((pf, i) => (
                        <FrogComponent key={`p1-${i}`} data={pf} />
                    ))}

                    {/* Grenouilles garées J2 */}
                    {isMulti && gameState.parkedFrogs2?.map((pf, i) => (
                        <FrogComponent key={`p2-${i}`} data={pf} />
                    ))}

                    {/* Grenouilles actives */}
                    <FrogComponent data={gameState.frog} deathType={deathBurst?.type} />
                    {isMulti && gameState.frog2 && (
                        <FrogComponent data={gameState.frog2} tint="blue" deathType={deathBurst?.type} />
                    )}

                    {/* Effets de mort différenciés */}
                    {deathBurst && deathBurst.type === 'road' && (
                        <DeathBurst key={`burst-${deathBurst.x}-${deathBurst.y}`} {...deathBurst} />
                    )}
                    {deathBurst && deathBurst.type === 'river' && (
                        <WaterRipple key={`ripple-${deathBurst.x}-${deathBurst.y}`} x={deathBurst.x} y={deathBurst.y} />
                    )}

                    {/* Flash d'écran au moment de l'impact */}
                    {deathBurst && (
                        <motion.div
                            key={`flash-${deathBurst.x}-${deathBurst.y}`}
                            style={{
                                position:      'absolute',
                                inset:         0,
                                background:    deathBurst.type === 'road'
                                    ? 'rgba(255, 80, 0, 0.45)'
                                    : 'rgba(0, 90, 200, 0.35)',
                                pointerEvents: 'none',
                                zIndex:        70,
                            }}
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: deathBurst.type === 'road' ? 0.2 : 0.45 }}
                        />
                    )}

                    <GameOverOverlay isVisible={isDead} onReset={handleRestart} onMenu={handleBackToMenu}
                                     highScores={gameState.highScores}
                                     breakdown={gameState.scoreBreakdown}
                                     breakdown2={gameState.scoreBreakdown2} />
                    <VictoryOverlay  isVisible={isWin}  onReset={handleRestart} onMenu={handleBackToMenu}
                                     highScores={gameState.highScores} winner={gameState.winner}
                                     breakdown={gameState.scoreBreakdown}
                                     breakdown2={gameState.scoreBreakdown2} />
                </motion.div>
            </div>

            {isPaused && (
                <PauseMenu isPaused={isPaused} onResume={handleResume}
                           onMenu={handleBackToMenu} onRestart={handleRestart}
                           settings={gameSettings} onSettingsChange={setGameSettings} />
            )}

            <p className="text-xs text-white/30 tracking-wide m-0">
                {settings.mode === 'network'
                    ? <span className="text-[#80cfff]/50">
                        {myPlayerNumber ? `Joueur ${myPlayerNumber} — ` : ''}↑ ↓ ← →
                      </span>
                    : isMulti
                    ? <><span className="text-[#50ff8c]/50 mr-3">J1 : ↑ ↓ ← →</span><span className="text-[#ff8c50]/50">J2 : Z Q S D</span></>
                    : <span className="font-[family-name:var(--font-orbitron)] text-[#50ff8c]/50 text-sm">↑ ↓ ← → pour déplacer la grenouille</span>
                }
            </p>
        </div>
    );
};

export default Game;
