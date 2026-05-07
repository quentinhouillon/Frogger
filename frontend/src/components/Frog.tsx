import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Frog as FrogType } from '../types/GameTypes';
import frogSprite from '../sprites/frog_idle.png';

interface FrogProps {
    data: FrogType;
    tint?: 'green' | 'blue';
    deathType?: 'road' | 'river';
}

/** Rotation (degrés) selon la direction du dernier saut */
function rotationFromDelta(dx: number, dy: number): number {
    if (dx > 0) return 90;   // droite
    if (dx < 0) return -90;  // gauche
    if (dy > 0) return 180;  // bas
    return 0;                // haut (position par défaut du sprite)
}

/**
 * Grenouille animée via Framer Motion.
 *
 * Effets :
 *  - Glissement spring vers la nouvelle position (x/y)
 *  - Rotation selon la direction du saut
 *  - Squeeze vertical au moment du saut (échelle)
 *  - Shake + fondu à la mort
 *  - Glow selon l'état
 */
const Frog: React.FC<FrogProps> = ({ data, tint, deathType }) => {
    const prevPos  = useRef({ x: data.x, y: data.y });
    const [rotation, setRotation] = useState(0);
    const [isJumping, setIsJumping] = useState(false);

    const isDead = data.state === 'DEAD';
    const isWin  = data.state === 'WIN';

    // Détecte un changement de position = saut
    useEffect(() => {
        const dx = data.x - prevPos.current.x;
        const dy = data.y - prevPos.current.y;

        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            setRotation(rotationFromDelta(dx, dy));
            setIsJumping(true);
            const t = setTimeout(() => setIsJumping(false), 110);
            prevPos.current = { x: data.x, y: data.y };
            return () => clearTimeout(t);
        }
    }, [data.x, data.y]);

    const tintFilter = tint === 'blue' ? 'hue-rotate(200deg) saturate(1.5)' : '';

    // Filtre selon état + type de mort
    const filter = isDead
        ? deathType === 'river'
            ? `drop-shadow(0 0 12px #0088ff) saturate(0.1) brightness(0.35) hue-rotate(160deg) ${tintFilter}`
            : `drop-shadow(0 0 16px #ff6600) saturate(0) brightness(0.4) sepia(1) hue-rotate(-20deg) ${tintFilter}`
        : isWin
        ? `drop-shadow(0 0 14px #44ff88) brightness(1.3) ${tintFilter}`
        : `drop-shadow(0 2px 6px rgba(0,0,0,0.9)) ${tintFilter}`;

    // Rotation à la mort : spin violent pour voiture, wobble pour eau
    const deathRotate = deathType === 'river'
        ? [rotation, rotation + 10, rotation - 7, rotation + 4, rotation]
        : [rotation, rotation - 25, rotation + 50, rotation + 360 + 180];

    // Échelle à la mort : squash brutal pour voiture, descente lente pour eau
    const deathScale = deathType === 'river'
        ? [1, 0.85, 0.65, 0.35, 0.05]
        : [1, 1.4, 0.08, 0];

    const deathDuration = deathType === 'river' ? 0.9 : 0.42;

    return (
        <motion.div
            style={{
                position:          'absolute',
                left:              0,
                top:               0,
                width:             data.width,
                height:            data.height,
                backgroundImage:   `url(${frogSprite})`,
                backgroundSize:    '100% 100%',
                backgroundRepeat:  'no-repeat',
                filter,
                zIndex:            50,
                originX:           '50%',
                originY:           '50%',
            }}
            animate={{
                x: data.x,
                y: data.y,

                rotate: isDead ? deathRotate : rotation,

                scale: isDead
                    ? deathScale
                    : isJumping
                    ? [1, 0.7, 1.2, 1]
                    : 1,
            }}
            transition={{
                x:      { type: 'spring', stiffness: 1200, damping: 40 },
                y:      { type: 'spring', stiffness: 1200, damping: 40 },
                rotate: { duration: isDead ? deathDuration : 0.08 },
                scale:  { duration: isDead ? deathDuration : 0.10, ease: isDead ? 'easeIn' : 'easeOut' },
            }}
        />
    );
};

export default Frog;