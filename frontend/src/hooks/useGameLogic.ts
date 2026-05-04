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
    return `START:${s.slotsCount}:${s.difficulty}`;
}

export function useGameLogic(settings: GameSettings) {
    const [gameState, setGameState]     = useState<GameState | null>(null);
    const [scale, setScale]             = useState(1);
    const prevFrogState                 = useRef<string>('LIVING');
    const [deathBurst, setDeathBurst]   = useState<DeathBurstState | null>(null);
    const settingsRef                   = useRef(settings);
    settingsRef.current                 = settings;

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
        const unsubscribe = wsService.subscribe((data: GameState) => setGameState(data));

        // Lance la partie avec les settings choisis dès la connexion
        const openHandler = () => wsService.send(startCmd(settingsRef.current));
        // Si déjà connecté, envoyer immédiatement
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

        const handleKeyUp = (e: KeyboardEvent) => { if (keyMap[e.key]) stopRepeat(); };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup',   handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup',   handleKeyUp);
            stopRepeat();
        };
    }, []);

    const resetGame = () => wsService.send(startCmd(settingsRef.current));

    return { gameState, scale, deathBurst, resetGame };
}
