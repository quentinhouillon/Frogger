import React from 'react';
import type { Frog as FrogType } from "../types/GameTypes";
import frogSprite from '../sprites/frog_idle.png';

interface FrogProps {
    data: FrogType;
}

const Frog: React.FC<FrogProps> = ({ data }) => {
    const isDead = data.state === 'DEAD';
    const isWin  = data.state === 'WIN';

    return (
        <div
            className={isDead ? 'animate-dead-flash' : ''}
            style={{
                position:          'absolute',
                left:              data.x,
                top:               data.y,
                width:             data.width,
                height:            data.height,
                backgroundImage:   `url(${frogSprite})`,
                backgroundSize:    '100% 100%',
                backgroundRepeat:  'no-repeat',
                zIndex:            50,
                filter: isDead
                    ? 'drop-shadow(0 0 8px #ff4444) saturate(0.3) brightness(0.6)'
                    : isWin
                    ? 'drop-shadow(0 0 12px #44ff88)'
                    : 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                transition: 'left 0.05s linear, top 0.05s linear, filter 0.2s ease',
            }}
        />
    );
};

export default Frog;