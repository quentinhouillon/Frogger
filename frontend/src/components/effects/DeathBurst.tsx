import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface DeathBurstProps {
    x: number;
    y: number;
    type: 'road' | 'river';
}

const ROAD_COLORS  = ['#ff4400', '#ff8800', '#ffcc00', '#ff2200', '#ffffff', '#ff6600'];
const RIVER_COLORS = ['#44aaff', '#00ddff', '#aaeeff', '#ffffff', '#66bbff'];

const DeathBurst: React.FC<DeathBurstProps> = ({ x, y, type }) => {
    const colors = type === 'road' ? ROAD_COLORS : RIVER_COLORS;
    const cx = x + 20;
    const cy = y + 20;

    // Particules rondes principales
    const particles = useMemo(() => {
        const COUNT = type === 'road' ? 30 : 20;
        return Array.from({ length: COUNT }, (_, i) => {
            // Route : directions chaotiques, rivière : cercle régulier
            const baseAngle = (i / COUNT) * Math.PI * 2;
            const jitter    = type === 'road' ? ((i * 137.5) % 1 - 0.5) * 0.8 : 0;
            const angle     = baseAngle + jitter;
            const dist      = type === 'road' ? 45 + (i % 5) * 14 : 30 + (i % 4) * 12;
            return {
                tx:    Math.cos(angle) * dist,
                ty:    Math.sin(angle) * dist,
                size:  type === 'road' ? 5 + (i % 5) * 3 : 4 + (i % 3) * 3,
                color: colors[i % colors.length],
                delay: (i % 5) * 0.02,
                dur:   type === 'road' ? 0.45 + (i % 3) * 0.08 : 0.55 + (i % 3) * 0.05,
            };
        });
    }, [type]);

    // Débris angulaires (uniquement pour voiture)
    const shards = useMemo(() => {
        if (type !== 'road') return [];
        return Array.from({ length: 10 }, (_, i) => {
            const angle = (i / 10) * Math.PI * 2 + 0.3;
            const dist  = 25 + (i % 4) * 18;
            return {
                tx:     Math.cos(angle) * dist,
                ty:     Math.sin(angle) * dist,
                width:  3 + (i % 3) * 2,
                height: 8 + (i % 4) * 4,
                rotate: (i * 47) % 360,
                color:  ROAD_COLORS[i % 3],
                delay:  i * 0.015,
            };
        });
    }, [type]);

    return (
        <>
            {particles.map((p, i) => (
                <motion.div
                    key={`p-${i}`}
                    style={{
                        position:        'absolute',
                        left:            cx - p.size / 2,
                        top:             cy - p.size / 2,
                        width:           p.size,
                        height:          p.size,
                        borderRadius:    '50%',
                        backgroundColor: p.color,
                        pointerEvents:   'none',
                        zIndex:          60,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: p.tx, y: p.ty, opacity: 0, scale: 0 }}
                    transition={{ duration: p.dur, ease: 'easeOut', delay: p.delay }}
                />
            ))}

            {shards.map((s, i) => (
                <motion.div
                    key={`shard-${i}`}
                    style={{
                        position:        'absolute',
                        left:            cx - s.width / 2,
                        top:             cy - s.height / 2,
                        width:           s.width,
                        height:          s.height,
                        borderRadius:    '2px',
                        backgroundColor: s.color,
                        pointerEvents:   'none',
                        zIndex:          61,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                    animate={{ x: s.tx, y: s.ty, opacity: 0, scale: 0, rotate: s.rotate }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: s.delay }}
                />
            ))}
        </>
    );
};

export default DeathBurst;
