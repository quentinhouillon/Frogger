import { useEffect, useRef, useState } from 'react';
import { wsService } from '../services/WebsocketService';
import type { GameState } from '../types/GameTypes';

const LANE_HEIGHT = 50;

export interface DeathBurstState {
    x: number;
    y: number;
    type: 'road' | 'river';
}

export function useGameLogic() {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [scale, setScale]         = useState(1);
    const prevFrogState             = useRef<string>('LIVING');
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

    return { gameState, scale, deathBurst };
}
