import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Frog as FrogType } from '../types/GameTypes';
import frogSprite from '../sprites/frog_idle.png';

interface ParkedFrogProps {
    data: FrogType;
    tint?: 'green' | 'blue';
}

/**
 * Grenouille garée sur un nénuphar (état WIN).
 *
 * Animation d'arrivée en 3 temps :
 *  1. Chute en vrille depuis le haut (y-80, rotate 360° → 0, scale 0.3 → 1.3)
 *  2. Impact au sol : squash brutal (scaleX large, scaleY court) → rebond normal
 *  3. Anneau de lumière qui explose vers l'extérieur + fade out
 *
 * Après l'animation d'entrée, la grenouille reste statique avec un glow.
 */
const ParkedFrog: React.FC<ParkedFrogProps> = ({ data, tint }) => {
    const [showRing, setShowRing] = useState(false);

    const tintFilter  = tint === 'blue' ? 'hue-rotate(200deg) saturate(1.5)' : '';
    const ringColor   = tint === 'blue' ? '#00ddff' : '#44ff88';
    const glowColor   = tint === 'blue' ? '#00aaff' : '#33ff77';
    const shadowColor = tint === 'blue' ? '0 0 18px #00aaff, 0 0 5px #fff' : '0 0 18px #33ff77, 0 0 5px #fff';

    // Déclenche l'anneau d'impact à mi-chemin de l'animation de chute (~280ms)
    useEffect(() => {
        const t = setTimeout(() => setShowRing(true), 280);
        return () => clearTimeout(t);
    }, []);

    return (
        <div style={{ position: 'absolute', left: data.x, top: data.y, width: data.width, height: data.height, zIndex: 50 }}>

            {/* ── Anneau d'impact ─────────────────────────────────────────── */}
            <AnimatePresence>
                {showRing && (
                    <>
                        {/* Anneau principal */}
                        <motion.div
                            key="ring1"
                            style={{
                                position:     'absolute',
                                left:         data.width / 2 - 30,
                                top:          data.height / 2 - 20,
                                width:        60,
                                height:       40,
                                borderRadius: '50%',
                                border:       `3px solid ${ringColor}`,
                                boxShadow:    `0 0 12px ${ringColor}`,
                                pointerEvents:'none',
                            }}
                            initial={{ opacity: 1, scale: 0.3 }}
                            animate={{ opacity: 0, scale: 3.2 }}
                            exit={{}}
                            transition={{ duration: 0.55, ease: 'easeOut' }}
                        />
                        {/* Second anneau décalé */}
                        <motion.div
                            key="ring2"
                            style={{
                                position:     'absolute',
                                left:         data.width / 2 - 20,
                                top:          data.height / 2 - 13,
                                width:        40,
                                height:       26,
                                borderRadius: '50%',
                                border:       `2px solid #ffffff`,
                                boxShadow:    `0 0 8px #ffffff`,
                                pointerEvents:'none',
                            }}
                            initial={{ opacity: 0.9, scale: 0.2 }}
                            animate={{ opacity: 0, scale: 2.5 }}
                            exit={{}}
                            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.06 }}
                        />
                        {/* Étoiles/étincelles autour */}
                        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                            const rad = (angle * Math.PI) / 180;
                            const tx  = Math.cos(rad) * 32;
                            const ty  = Math.sin(rad) * 22;
                            return (
                                <motion.div
                                    key={`spark-${i}`}
                                    style={{
                                        position:        'absolute',
                                        left:            data.width / 2 - 4,
                                        top:             data.height / 2 - 4,
                                        width:           8,
                                        height:          8,
                                        borderRadius:    '50%',
                                        backgroundColor: i % 2 === 0 ? ringColor : '#ffffff',
                                        boxShadow:       `0 0 6px ${ringColor}`,
                                        pointerEvents:   'none',
                                    }}
                                    initial={{ x: 0, y: 0, opacity: 1, scale: 1.2 }}
                                    animate={{ x: tx, y: ty, opacity: 0, scale: 0 }}
                                    exit={{}}
                                    transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.015 }}
                                />
                            );
                        })}
                    </>
                )}
            </AnimatePresence>

            {/* ── Grenouille : chute + squash + rebond ─────────────────────── */}
            <motion.div
                style={{
                    position:         'absolute',
                    left:             0,
                    top:              0,
                    width:            data.width,
                    height:           data.height,
                    backgroundImage:  `url(${frogSprite})`,
                    backgroundSize:   '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    filter:           `drop-shadow(0 0 10px ${glowColor}) brightness(1.2) ${tintFilter}`,
                    boxShadow:        shadowColor,
                    transformOrigin:  'center bottom',
                }}
                // Impact → rebond → stabilisation
                initial={{ scaleX: 1.6, scaleY: 0.5, opacity: 0 }}
                animate={{
                    y:       [2, -8, 0],
                    rotate:  [5, -3, 0],
                    scaleX:  [1.6, 0.9, 1.0],
                    scaleY:  [0.5, 1.2, 1.0],
                    opacity: [1, 1, 1],
                }}
                transition={{
                    duration: 0.32,
                    times:    [0, 0.5, 1],
                    ease:     ["easeOut", "easeOut"]
                }}
            />
        </div>
    );
};

export default ParkedFrog;
