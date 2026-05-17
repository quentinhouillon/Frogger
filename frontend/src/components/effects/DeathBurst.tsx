import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import frogSprite from '../../sprites/frog_idle.png';

export interface DeathBurstProps {
    id?: number;
    x: number;
    y: number;
    type: 'road' | 'river';
}

// ── Constantes de couleurs ────────────────────────────────────────────────────
const ROAD_SPARK_COLORS  = ['#ff2222', '#ff6600', '#ffcc00', '#ffffff', '#ff4444'];
const RIVER_DROP_COLORS  = ['#00ccff', '#44eeff', '#aaf0ff', '#ffffff', '#0077cc'];

/**
 * Effet visuel de mort : différencié selon la cause.
 *
 *  ROUTE  → Éclats rouges/orange en éventail + grenouille qui s'aplatit (roadkill)
 *  RIVIÈRE → Gouttes d'eau + ondulations concentriques + grenouille qui s'enfonce
 *
 * Le composant est rendu à la position de l'impact AVANT le respawn,
 * donc il s'affiche exactement là où la grenouille est morte.
 */
const DeathBurst: React.FC<DeathBurstProps> = ({ x, y, type }) => {
    // Centre du sprite (40×40)
    const cx = x + 20;
    const cy = y + 20;

    // Pré-calcul stable des particules pour éviter les re-render aléatoires
    const roadSparks = useMemo(() => {
        return Array.from({ length: 28 }, (_, i) => {
            const angle    = (i / 28) * Math.PI * 2 + Math.random() * 0.3;
            const distance = 28 + (i % 5) * 12;
            const size     = 3 + (i % 4) * 2.5;
            return {
                tx:    Math.cos(angle) * distance,
                ty:    Math.sin(angle) * distance,
                size,
                color: ROAD_SPARK_COLORS[i % ROAD_SPARK_COLORS.length],
                delay: (i % 4) * 0.025,
                dur:   0.38 + (i % 3) * 0.08,
            };
        });
    }, []);

    const waterDrops = useMemo(() => {
        return Array.from({ length: 20 }, (_, i) => {
            // Les gouttes s'envolent vers le haut principalement
            const angle    = (Math.PI) + (i / 20) * Math.PI + Math.random() * 0.4;
            const distance = 15 + (i % 4) * 10;
            const size     = 3 + (i % 3) * 2;
            return {
                tx:    Math.cos(angle) * distance,
                ty:    Math.sin(angle) * distance - 8,
                size,
                color: RIVER_DROP_COLORS[i % RIVER_DROP_COLORS.length],
                delay: i * 0.018,
                dur:   0.5 + (i % 3) * 0.12,
            };
        });
    }, []);

    // ── ROUTE : Écrasement ────────────────────────────────────────────────────
    if (type === 'road') {
        return (
            <div style={{ position: 'absolute', left: cx, top: cy, pointerEvents: 'none', zIndex: 55 }}>
                {/* Éclairs/éclats */}
                {roadSparks.map((p, i) => (
                    <motion.div
                        key={`s-${i}`}
                        style={{
                            position:        'absolute',
                            left:            -p.size / 2,
                            top:             -p.size / 2,
                            width:           p.size,
                            height:          p.size,
                            borderRadius:    i % 3 === 0 ? '20% 80% 20% 80%' : '50%', // mix de ronds et d'éclats
                            backgroundColor: p.color,
                            boxShadow:       `0 0 6px ${p.color}`,
                        }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{ x: p.tx, y: p.ty, opacity: 0, scale: 0 }}
                        transition={{ duration: p.dur, ease: [0.2, 0.8, 0.4, 1], delay: p.delay }}
                    />
                ))}

                {/* Flash d'impact central */}
                <motion.div
                    style={{
                        position:     'absolute',
                        left:         -25,
                        top:          -20,
                        width:        50,
                        height:       40,
                        borderRadius: '50%',
                        background:   'radial-gradient(circle, #ffffff 0%, #ff6600 40%, transparent 70%)',
                        mixBlendMode: 'screen',
                    }}
                    initial={{ opacity: 1, scale: 0.5 }}
                    animate={{ opacity: 0, scale: 2.5 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                />

                {/* Grenouille aplatie (Roadkill squash) */}
                <motion.div
                    style={{
                        position:        'absolute',
                        left:            -20,
                        top:             -20,
                        width:           40,
                        height:          40,
                        backgroundImage: `url(${frogSprite})`,
                        backgroundSize:  '100% 100%',
                        backgroundRepeat:'no-repeat',
                        filter:          'sepia(1) saturate(3) hue-rotate(-20deg) brightness(0.7)',
                        transformOrigin: 'center bottom',
                    }}
                    initial={{ scaleX: 1, scaleY: 1, opacity: 1, y: 0 }}
                    animate={{
                        scaleX:  [1, 1.8, 2.2, 2.0],
                        scaleY:  [1, 0.25, 0.08, 0.05],
                        opacity: [1, 1,  0.7, 0],
                        y:       [0, 8, 12, 12],
                    }}
                    transition={{ duration: 0.55, ease: [0.1, 0.5, 0.3, 1], times: [0, 0.3, 0.7, 1] }}
                />
            </div>
        );
    }

    // ── RIVIÈRE : Noyade ──────────────────────────────────────────────────────
    return (
        <div style={{ position: 'absolute', left: x, top: y, width: 40, height: 40, pointerEvents: 'none', zIndex: 55 }}>
            {/* Ondulations concentriques de l'eau */}
            {[0, 0.2, 0.45].map((delay, i) => (
                <motion.div
                    key={`ripple-${i}`}
                    style={{
                        position:     'absolute',
                        left:         20 - (20 + i * 6),
                        top:          20 - (10 + i * 3),
                        width:        (40 + i * 12),
                        height:       (20 + i * 6),
                        borderRadius: '50%',
                        border:       `${2 - i * 0.4}px solid #00ddff`,
                        boxShadow:    '0 0 10px rgba(0,200,255,0.6)',
                        pointerEvents:'none',
                    }}
                    initial={{ opacity: 0.9, scale: 0.3 }}
                    animate={{ opacity: 0, scale: 1.6 }}
                    transition={{ duration: 1.1, delay, ease: 'easeOut' }}
                />
            ))}

            {/* Éclaboussures (gouttes qui montent) */}
            {waterDrops.map((p, i) => (
                <motion.div
                    key={`drop-${i}`}
                    style={{
                        position:        'absolute',
                        left:            20 - p.size / 2,
                        top:             20 - p.size / 2,
                        width:           p.size,
                        height:          p.size * (i % 2 === 0 ? 1.6 : 1), // quelques gouttes allongées
                        borderRadius:    i % 2 === 0 ? '50% 50% 50% 50% / 60% 60% 40% 40%' : '50%',
                        backgroundColor: p.color,
                        boxShadow:       `0 0 4px ${p.color}`,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: p.tx, y: p.ty, opacity: 0, scale: 0.2 }}
                    transition={{ duration: p.dur, ease: 'easeOut', delay: p.delay }}
                />
            ))}

            {/* Grenouille qui s'enfonce dans l'eau */}
            <motion.div
                style={{
                    position:        'absolute',
                    left:            0,
                    top:             0,
                    width:           40,
                    height:          40,
                    backgroundImage: `url(${frogSprite})`,
                    backgroundSize:  '100% 100%',
                    backgroundRepeat:'no-repeat',
                    // Teinte bleue-verte pour simuler la réfraction sous l'eau
                    filter:          'hue-rotate(160deg) saturate(1.2) brightness(0.55)',
                    transformOrigin: 'center center',
                }}
                initial={{ opacity: 1, scale: 1, y: 0, rotate: 0, scaleX: 1 }}
                animate={{
                    opacity: [1, 0.85, 0.5, 0],
                    scale:   [1, 0.9, 0.55, 0.2],
                    y:       [0, 4, 14, 22],       // s'enfonce
                    rotate:  [0, -8, 18, -30, 45], // tourbillonne légèrement
                    scaleX:  [1, 0.95, 0.8, 0.6],  // se rétrécit horizontalement (réfraction)
                }}
                transition={{
                    duration: 1.0,
                    ease:     'easeIn',
                    times:    [0, 0.25, 0.65, 1],
                }}
            />
        </div>
    );
};

export default DeathBurst;
