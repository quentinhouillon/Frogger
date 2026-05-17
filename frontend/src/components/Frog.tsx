import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Frog as FrogType } from '../types/GameTypes';
import frogSprite from '../sprites/frog_idle.png';
import jump1 from '../sprites/frog_jump_1.png';
import jump2 from '../sprites/frog_jump_2.png';
import jump3 from '../sprites/frog_jump_3.png';
import jump4 from '../sprites/frog_jump_4.png';
import jump5 from '../sprites/frog_jump_5.png';
import jump6 from '../sprites/frog_jump_6.png';

// ── Sprites de saut ──────────────────────────────────────────────────────────
const JUMP_FRAMES: string[] = [jump1, jump2, jump3, jump4, jump5, jump6];
const FRAME_DURATION_MS     = 18;   // durée d'une frame (ms) — 6×18 = 108ms total
const JUMP_THRESHOLD        = 20;   // px delta minimum pour considérer un vrai saut

interface FrogProps {
    data:      FrogType;
    tint?:     'green' | 'blue';
    hitFlash?: boolean;
}

function rotationFromDelta(dx: number, dy: number): number {
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 90 : -90;
    return dy > 0 ? 180 : 0;
}

/**
 * Grenouille animée.
 *
 * Stratégie sprite :
 *  Le défilement des frames de saut est fait en MANIPULATION DIRECTE du DOM
 *  (divRef.current.style.backgroundImage) via une chaîne de setTimeout.
 *  Cela évite complètement le cycle de rendu React (qui peut batcher/retarder
 *  les setState), garantissant un timing précis indépendant du scheduler React.
 *
 * Animation d'arrivée (WIN) :
 *  Les grenouilles garées (parkedFrogs) sont montées avec l'état WIN.
 *  Framer Motion's `initial` / `animate` se déclenchent au MOUNT → pop d'entrée
 *  one-shot, sans animation continue.
 */
const Frog: React.FC<FrogProps> = ({ data, tint, hitFlash }) => {
    const divRef       = useRef<HTMLDivElement>(null);
    const prevPos      = useRef({ x: data.x, y: data.y });
    const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isJumpingRef = useRef(false);

    const [rotation, setRotation] = useState(0);

    const isDead = data.state === 'DEAD';
    const isWin  = data.state === 'WIN';

    // ── Nettoyage au démontage ───────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // ── Animation de saut — manipulation directe du DOM ─────────────────────
    const startJump = useCallback((dx: number, dy: number) => {
        // Annule une animation en cours
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        setRotation(rotationFromDelta(dx, dy));
        isJumpingRef.current = true;

        let frame = 0;

        const advance = () => {
            if (!divRef.current || !isJumpingRef.current) return;

            // Mise à jour directe du style sans passer par React
            divRef.current.style.backgroundImage = `url(${JUMP_FRAMES[frame]})`;

            frame++;
            if (frame < JUMP_FRAMES.length) {
                timerRef.current = setTimeout(advance, FRAME_DURATION_MS);
            } else {
                // Animation terminée → retour au sprite idle
                isJumpingRef.current = false;
                divRef.current.style.backgroundImage = `url(${frogSprite})`;
                timerRef.current = null;
            }
        };

        // Démarre immédiatement sur la frame 0
        advance();
    }, []);

    // ── Détection de saut (ignoré si mort ou parked/WIN) ────────────────────
    useEffect(() => {
        if (isDead || isWin) {
            prevPos.current = { x: data.x, y: data.y };
            return;
        }

        const dx = data.x - prevPos.current.x;
        const dy = data.y - prevPos.current.y;
        prevPos.current = { x: data.x, y: data.y };

        // Saut intentionnel : déclenche l'animation de sprite
        if (Math.abs(dx) > JUMP_THRESHOLD || Math.abs(dy) > JUMP_THRESHOLD) {
            startJump(dx, dy);
        }
        // Dérive passive : on ne fait rien (isJumpingRef reste inchangé)
    }, [data.x, data.y, isDead, isWin, startJump]);

    // ── Filtres CSS ──────────────────────────────────────────────────────────
    const tintFilter = tint === 'blue' ? 'hue-rotate(200deg) saturate(1.5)' : '';
    const filter     = `drop-shadow(0 2px 8px rgba(0,0,0,0.85)) ${tintFilter}`;

    const flashClass = hitFlash ? 'animate-dead-flash' : '';

    // ── Rendu ────────────────────────────────────────────────────────────────
    //
    // Les parked frogs (isWin=true) sont MONTÉS une seule fois.
    // Framer Motion joue initial→animate au mount → pop d'entrée one-shot.
    // La grenouille active n'a jamais l'état WIN, donc pas d'animation de mount.
    //
    return (
        <motion.div
            ref={divRef}
            className={flashClass}
            style={{
                position:         'absolute',
                left:             0,
                top:              0,
                width:            data.width,
                height:           data.height,
                backgroundImage:  `url(${frogSprite})`,
                backgroundSize:   '100% 100%',
                backgroundRepeat: 'no-repeat',
                filter:           filter,
                zIndex:           50,
            }}
            // initial/animate ne jouent qu'au MOUNT pour les parked frogs (WIN)
            // La grenouille active a initial={false} pour sauter le mount
            initial={isWin ? { scale: 0, opacity: 0 } : false}
            animate={{
                x:       data.x,
                y:       data.y,
                rotate:  rotation,
                opacity: isDead ? 0 : 1,
                scale:   1,
            }}
            transition={{
                x:       { duration: 0 },
                y:       { duration: 0 },
                rotate:  { duration: 0 },
                opacity: { duration: 0.05 },
                scale:   { duration: 0 },
            }}
        />
    );
};

export default Frog;