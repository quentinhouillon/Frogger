import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Frog as FrogType } from '../types/GameTypes';
import frogSprite from '../sprites/frog_idle.png';

interface FrogProps {
    data: FrogType;
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
const Frog: React.FC<FrogProps> = ({ data }) => {
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

    const filter = isDead
        ? 'drop-shadow(0 0 10px #ff4444) saturate(0.2) brightness(0.5)'
        : isWin
        ? 'drop-shadow(0 0 14px #44ff88) brightness(1.3)'
        : 'drop-shadow(0 2px 6px rgba(0,0,0,0.9))';

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
                // Position : spring physique pour un mouvement net
                x: data.x,
                y: data.y,

                // Rotation : direction du saut, shake à la mort
                rotate: isDead
                    ? [0, -20, 20, -12, 12, 0]
                    : rotation,

                // Échelle : squeeze puis étirement au saut, spin à la mort
                scale: isDead
                    ? [1, 1.5, 0]
                    : isJumping
                    ? [1, 0.7, 1.2, 1]
                    : 1,
            }}
            transition={{
                x:      { type: 'spring', stiffness: 1200, damping: 40 },
                y:      { type: 'spring', stiffness: 1200, damping: 40 },
                rotate: { duration: isDead ? 0.35 : 0.08 },
                scale:  { duration: isDead ? 0.35 : 0.10, ease: 'easeOut' },
            }}
        />
    );
};

export default Frog;