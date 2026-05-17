import { useEffect, useRef, useState } from 'react';
import { getWebSocketUrl, wsService } from '../services/WebsocketService';
import soundManager from '../services/SoundService';
import type { GameState, GameSettings } from '../types/GameTypes';

const LANE_HEIGHT = 50;

export interface DeathBurstState {
    id: number;
    x: number;
    y: number;
    type: 'road' | 'river';
}

function startCmd(s: GameSettings) {
    return `START:${s.slotsCount}:${s.difficulty}:${s.mode}`;
}

export function useGameLogic(settings: GameSettings, isPaused = false) {
    const [gameState, setGameState]           = useState<GameState | null>(null);
    const [scale, setScale]                   = useState(1);
    const [myPlayerNumber, setMyPlayerNumber] = useState<1 | 2 | null>(null);
    const [opponentLeft, setOpponentLeft]     = useState(false);
    const prevFrogState                       = useRef<string>('LIVING');
    const prevScore                          = useRef(0);
    const prevParkedFrogs                    = useRef(0);
    const [deathBurst, setDeathBurst]         = useState<DeathBurstState | null>(null);
    const [hitFlash, setHitFlash]             = useState(false);
    const [hitFlash2, setHitFlash2]           = useState(false);
    const prevFrogState2                      = useRef<string>('LIVING');
    const hitTimer                            = useRef<any>(null);
    const hitTimer2                           = useRef<any>(null);
    const settingsRef                         = useRef(settings);
    settingsRef.current                       = settings;

    /* ── Responsive ───────────────────────────────────────────────────── */
    useEffect(() => {
        const updateScale = () => {
            if (!gameState) return;
            const margin = 32;
            const maxW   = window.innerWidth  - margin * 2;
            const maxH   = window.innerHeight - 160;
            setScale(Math.min(1, maxW / gameState.screenWidth, maxH / gameState.screenHeight));
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [gameState?.screenWidth, gameState?.screenHeight]);

    /* ── WebSocket ────────────────────────────────────────────────────── */
    useEffect(() => {
        wsService.connect(getWebSocketUrl());

        const unsubscribe = wsService.subscribe((data: any) => {
            if (data.type === 'init') {
                setMyPlayerNumber(data.playerNumber as 1 | 2);
                return;
            }
            if (data.type === 'opponentDisconnected') {
                setOpponentLeft(true);
                return;
            }
            setGameState(data as GameState);
        });

        const openHandler = () => wsService.send(startCmd(settingsRef.current));
        wsService.onConnected(openHandler);

        return () => {
            unsubscribe();
            wsService.removeOnConnected(openHandler);
        };
    }, []);

    const prevLifes                           = useRef<number>(-1);
    const prevLifes2                          = useRef<number>(-1);
    const prevFrogRef                         = useRef<any>(null);
    const prevFrog2Ref                        = useRef<any>(null);

    /* ── Détection de mort ────────────────────────────────────────────── */
    useEffect(() => {
        if (!gameState) return;
        const { frog, frog2, lanes, lifes, lifes2 } = gameState;

        if (prevLifes.current === -1) {
            prevLifes.current = lifes;
            prevLifes2.current = lifes2;
            prevFrogRef.current = frog;
            prevFrog2Ref.current = frog2;
            return;
        }

        // --- Frog 1 ---
        const isDead1 = frog.state === 'DEAD' && prevFrogState.current !== 'DEAD';
        const lostLife1 = lifes < prevLifes.current;
        
        if (isDead1 || lostLife1) {
            const deathX = isDead1 ? frog.x : (prevFrogRef.current?.x ?? frog.x);
            const deathY = isDead1 ? frog.y : (prevFrogRef.current?.y ?? frog.y);

            if (frog.state === 'DEAD' && prevFrogState.current !== 'DEAD') {
                prevFrogState.current = 'DEAD'; // empêche les ticks suivants de re-déclencher
            }

            const inRiver = lanes.some(lane =>
                lane.laneType === 'RIVER' &&
                deathY >= lane.positionY &&
                deathY <  lane.positionY + LANE_HEIGHT
            );
            
            setDeathBurst({ id: Date.now(), x: deathX, y: deathY, type: inRiver ? 'river' : 'road' });
            soundManager.playSound('death');

            if (hitTimer.current) clearTimeout(hitTimer.current);
            setHitFlash(true);
            hitTimer.current = setTimeout(() => setHitFlash(false), 900); // 0.3s * 3 = 900ms pour l'anim CSS

            setTimeout(() => setDeathBurst(null), 1500);
        }

        prevFrogState.current = frog.state;
        prevLifes.current = lifes;
        prevFrogRef.current = frog;

        // --- Frog 2 (multijoueur) ---
        if (frog2) {
            const isDead2 = frog2.state === 'DEAD' && prevFrogState2.current !== 'DEAD';
            const lostLife2 = lifes2 < prevLifes2.current;
            
            if (isDead2 || lostLife2) {
                if (hitTimer2.current) clearTimeout(hitTimer2.current);
                setHitFlash2(true);
                hitTimer2.current = setTimeout(() => setHitFlash2(false), 900);
            }
            prevFrogState2.current = frog2.state;
            prevLifes2.current = lifes2;
            prevFrog2Ref.current = frog2;
        }
    }, [gameState]);

    useEffect(() => {
        if (!gameState) return;

        const scoreDelta = gameState.score - prevScore.current;
        const parkedGrowth = gameState.parkedFrogs.length - prevParkedFrogs.current;

        if (parkedGrowth > 0) {
            soundManager.playSound('frogPickup');
            if (scoreDelta >= 50) soundManager.playSound('extraScore');
            else if (scoreDelta > 0) soundManager.playSound('score');
        } else if (scoreDelta > 0) {
            if (scoreDelta >= 50) soundManager.playSound('extraScore');
            else soundManager.playSound('score');
        }

        prevScore.current = gameState.score;
        prevParkedFrogs.current = gameState.parkedFrogs.length;
    }, [gameState]);

    /* ── Clavier ──────────────────────────────────────────────────────── */
    useEffect(() => {
        const isNetwork = settingsRef.current.mode === 'network';

        const keyMap: Record<string, string> = {
            ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
            ...(!isNetwork && {
                z: 'UP2', Z: 'UP2', s: 'DOWN2', S: 'DOWN2',
                q: 'LEFT2', Q: 'LEFT2', d: 'RIGHT2', D: 'RIGHT2',
            }),
        };
        const INITIAL_DELAY_MS   = 200;
        const REPEAT_INTERVAL_MS = 150;

        let holdTimeout:    ReturnType<typeof setTimeout>  | null = null;
        let repeatInterval: ReturnType<typeof setInterval> | null = null;

        const stopRepeat = () => {
            if (holdTimeout)    { clearTimeout(holdTimeout);    holdTimeout    = null; }
            if (repeatInterval) { clearInterval(repeatInterval); repeatInterval = null; }
        };

        if (isPaused) {
            stopRepeat();
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            const cmd = keyMap[e.key];
            if (!cmd || holdTimeout || repeatInterval) return;
            e.preventDefault();
            wsService.send(cmd);
            soundManager.playSound('move');
            holdTimeout = setTimeout(() => {
                repeatInterval = setInterval(() => wsService.send(cmd), REPEAT_INTERVAL_MS);
            }, INITIAL_DELAY_MS);
        };

        const handleKeyUp = (e: KeyboardEvent) => { if (keyMap[e.key]) stopRepeat(); };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup',   handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup',   handleKeyUp);
            stopRepeat();
        };
    }, [isPaused]);

    const resetGame = () => {
        setOpponentLeft(false);
        wsService.send(startCmd(settingsRef.current));
    };

    return { gameState, scale, deathBurst, resetGame, myPlayerNumber, opponentLeft, hitFlash, hitFlash2 };
}
