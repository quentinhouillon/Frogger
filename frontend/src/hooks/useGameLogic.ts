import { useEffect, useRef, useState } from 'react';
import { wsService } from '../services/WebsocketService';
import type { GameState, GameSettings } from '../types/GameTypes';

const LANE_HEIGHT = 50;

export interface DeathBurstState {
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
    const [deathBurst, setDeathBurst]         = useState<DeathBurstState | null>(null);
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
        wsService.connect('ws://localhost:8080');

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

    /* ── Détection de mort ────────────────────────────────────────────── */
    useEffect(() => {
        if (!gameState) return;
        const { frog, lanes } = gameState;

        if (frog.state === 'DEAD' && prevFrogState.current !== 'DEAD') {
            const inRiver = lanes.some(lane =>
                lane.laneType === 'RIVER' &&
                frog.y >= lane.positionY &&
                frog.y <  lane.positionY + LANE_HEIGHT
            );
            setDeathBurst({ x: frog.x, y: frog.y, type: inRiver ? 'river' : 'road' });
            const t = setTimeout(() => setDeathBurst(null), 1500);
            return () => clearTimeout(t);
        }

        prevFrogState.current = frog.state;
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

        // Quand la partie est en pause, on coupe toute répétition clavier
        if (isPaused) {
            stopRepeat();
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            const cmd = keyMap[e.key];
            if (!cmd || holdTimeout || repeatInterval) return;
            e.preventDefault();
            wsService.send(cmd);
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

    return { gameState, scale, deathBurst, resetGame, myPlayerNumber, opponentLeft };
}
