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

const JUMP_FRAMES: string[] = [jump1, jump2, jump3, jump4, jump5, jump6];
const FRAME_DURATION_MS     = 18;
const JUMP_THRESHOLD        = 20;

interface FrogProps {
    data: FrogType;
    tint?: 'green' | 'blue';
    deathType?: 'road' | 'river';
    hitFlash?: boolean;
}

function rotationFromDelta(dx: number, dy: number): number {
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 90 : -90;
    return dy > 0 ? 180 : 0;
}

const Frog: React.FC<FrogProps> = ({ data, tint, hitFlash, deathType }) => {
    const divRef       = useRef<HTMLDivElement>(null);
    const prevPos      = useRef({ x: data.x, y: data.y });
    const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isJumpingRef = useRef(false);

    const [rotation, setRotation] = useState(0);
    const [isJumping, setIsJumping] = useState(false);

    const isDead = data.state === 'DEAD';
    const isWin  = data.state === 'WIN';

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const startJump = useCallback((dx: number, dy: number) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        setRotation(rotationFromDelta(dx, dy));
        isJumpingRef.current = true;
        setIsJumping(true);

        let frame = 0;

        const advance = () => {
            if (!divRef.current || !isJumpingRef.current) return;
            divRef.current.style.backgroundImage = `url(${JUMP_FRAMES[frame]})`;
            frame++;
            if (frame < JUMP_FRAMES.length) {
                timerRef.current = setTimeout(advance, FRAME_DURATION_MS);
            } else {
                isJumpingRef.current = false;
                setIsJumping(false);
                divRef.current.style.backgroundImage = `url(${frogSprite})`;
                timerRef.current = null;
            }
        };

        advance();
    }, []);

    useEffect(() => {
        if (isDead || isWin) {
            prevPos.current = { x: data.x, y: data.y };
            return;
        }

        const dx = data.x - prevPos.current.x;
        const dy = data.y - prevPos.current.y;
        prevPos.current = { x: data.x, y: data.y };

        if (Math.abs(dx) > JUMP_THRESHOLD || Math.abs(dy) > JUMP_THRESHOLD) {
            startJump(dx, dy);
        }
    }, [data.x, data.y, isDead, isWin, startJump]);

    const tintFilter = tint === 'blue' ? 'hue-rotate(200deg) saturate(1.5)' : '';

    const filter = isDead
        ? deathType === 'river'
            ? `drop-shadow(0 0 12px #0088ff) saturate(0.1) brightness(0.35) hue-rotate(160deg) ${tintFilter}`
            : `drop-shadow(0 0 16px #ff6600) saturate(0) brightness(0.4) sepia(1) hue-rotate(-20deg) ${tintFilter}`
        : isWin
        ? `drop-shadow(0 0 14px #44ff88) brightness(1.3) ${tintFilter}`
        : `drop-shadow(0 2px 6px rgba(0,0,0,0.9)) ${tintFilter}`;

    const deathRotate = deathType === 'river'
        ? [rotation, rotation + 10, rotation - 7, rotation + 4, rotation]
        : [rotation, rotation - 25, rotation + 50, rotation + 360 + 180];

    const deathScale = deathType === 'river'
        ? [1, 0.85, 0.65, 0.35, 0.05]
        : [1, 1.4, 0.08, 0];

    const deathDuration = deathType === 'river' ? 0.9 : 0.42;

    const flashClass = hitFlash ? 'animate-dead-flash' : '';

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
            initial={isWin ? { scale: 0, opacity: 0 } : false}
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