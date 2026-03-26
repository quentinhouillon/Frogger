import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface DeathBurstProps {
    /** Position X du coin haut-gauche de la grenouille (pixels dans le canvas) */
    x: number;
    /** Position Y du coin haut-gauche de la grenouille (pixels dans le canvas) */
    y: number;
    /** 'road' → particules rouges/orange | 'river' → particules bleues */
    type: 'road' | 'river';
}

const ROAD_COLORS  = ['#ff4444', '#ff8844', '#ffdd00', '#ffffff'];
const RIVER_COLORS = ['#44aaff', '#00ddff', '#aaeeff', '#ffffff'];

/**
 * Burst de particules à la mort de la grenouille.
 * Implémenté avec Framer Motion (divs animés) — léger et sans dépendance externe.
 *
 * Chaque particule :
 *  - part du centre de la grenouille
 *  - se propulse dans une direction aléatoire pré-calculée
 *  - se réduit et disparaît en 0.6s
 */
const DeathBurst: React.FC<DeathBurstProps> = ({ x, y, type }) => {
    const colors = type === 'road' ? ROAD_COLORS : RIVER_COLORS;

    // Pré-calcul des particules (useMemo évite le recalcul à chaque render)
    const particles = useMemo(() => {
        const COUNT = 20;
        return Array.from({ length: COUNT }, (_, i) => {
            const angle    = (i / COUNT) * Math.PI * 2;
            const distance = 30 + (i % 4) * 12;
            return {
                tx:    Math.cos(angle) * distance,
                ty:    Math.sin(angle) * distance,
                size:  4 + (i % 3) * 3,
                color: colors[i % colors.length],
                delay: (i % 3) * 0.03,
            };
        });
    }, [type]);

    // Centre de la grenouille (frog est 40×40)
    const cx = x + 20;
    const cy = y + 20;

    return (
        <>
            {particles.map((p, i) => (
                <motion.div
                    key={i}
                    style={{
                        position:      'absolute',
                        left:          cx - p.size / 2,
                        top:           cy - p.size / 2,
                        width:         p.size,
                        height:        p.size,
                        borderRadius:  '50%',
                        backgroundColor: p.color,
                        pointerEvents: 'none',
                        zIndex:        60,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: p.tx, y: p.ty, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut', delay: p.delay }}
                />
            ))}
        </>
    );
};

export default DeathBurst;
