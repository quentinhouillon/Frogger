import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface WaterRippleProps {
    x: number;
    y: number;
}

const WaterRipple: React.FC<WaterRippleProps> = ({ x, y }) => {
    const cx = x + 20;
    const cy = y + 20;

    // 3 cercles concentriques ovales qui s'élargissent (surface de l'eau)
    const rings = useMemo(() => [
        { delay: 0,    w: 28, h: 12, dur: 0.75, opacity: 0.9 },
        { delay: 0.2,  w: 28, h: 12, dur: 0.88, opacity: 0.75 },
        { delay: 0.4,  w: 28, h: 12, dur: 1.0,  opacity: 0.55 },
    ], []);

    // Bulles qui remontent à la surface
    const bubbles = useMemo(() =>
        Array.from({ length: 10 }, (_, i) => ({
            ox:    (i % 5 - 2) * 6,
            size:  2 + (i % 4),
            rise:  18 + (i % 3) * 10,
            drift: ((i % 2) * 2 - 1) * (2 + (i % 4) * 2),
            delay: i * 0.055,
            dur:   0.55 + (i % 3) * 0.1,
        }))
    , []);

    // Gouttelettes d'éclaboussure qui partent sur les côtés
    const drops = useMemo(() =>
        Array.from({ length: 7 }, (_, i) => {
            const angle = ((i / 7) * Math.PI * 2) - Math.PI / 2;
            const dist  = 14 + (i % 3) * 7;
            return {
                tx:    Math.cos(angle) * dist,
                ty:    Math.sin(angle) * dist - 12,
                size:  2 + (i % 3),
                delay: 0.02 + i * 0.035,
            };
        })
    , []);

    return (
        <>
            {/* Ronds d'eau */}
            {rings.map((r, i) => (
                <motion.div
                    key={`ring-${i}`}
                    style={{
                        position:      'absolute',
                        left:          cx - r.w / 2,
                        top:           cy - r.h / 2,
                        width:         r.w,
                        height:        r.h,
                        borderRadius:  '50%',
                        border:        '1.5px solid rgba(100, 200, 255, 0.85)',
                        pointerEvents: 'none',
                        zIndex:        55,
                    }}
                    initial={{ scale: 0.4, opacity: r.opacity }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: r.dur, ease: 'easeOut', delay: r.delay }}
                />
            ))}

            {/* Bulles qui remontent */}
            {bubbles.map((b, i) => (
                <motion.div
                    key={`bubble-${i}`}
                    style={{
                        position:     'absolute',
                        left:         cx + b.ox - b.size / 2,
                        top:          cy - b.size / 2,
                        width:        b.size,
                        height:       b.size,
                        borderRadius: '50%',
                        background:   'radial-gradient(circle at 35% 35%, rgba(220,245,255,0.95), rgba(80,170,255,0.4))',
                        border:       '1px solid rgba(180,230,255,0.8)',
                        pointerEvents:'none',
                        zIndex:       58,
                    }}
                    initial={{ y: 0, x: 0, opacity: 0.9, scale: 1 }}
                    animate={{ y: -b.rise, x: b.drift, opacity: 0, scale: 0.2 }}
                    transition={{ duration: b.dur, ease: 'easeOut', delay: b.delay }}
                />
            ))}

            {/* Gouttelettes d'éclaboussure */}
            {drops.map((d, i) => (
                <motion.div
                    key={`drop-${i}`}
                    style={{
                        position:     'absolute',
                        left:         cx - d.size / 2,
                        top:          cy - d.size,
                        width:        d.size,
                        height:       d.size * 1.8,
                        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                        background:   'rgba(140, 210, 255, 0.85)',
                        pointerEvents:'none',
                        zIndex:       57,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: d.tx, y: d.ty, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: d.delay }}
                />
            ))}
        </>
    );
};

export default WaterRipple;
