import React from 'react';
import type { Obstacle as ObstacleType } from "../types/GameTypes";

import carSprite from '../sprites/car_yellow.png';
import truckSprite from '../sprites/truck_red.png';
import turtleSprite from '../sprites/turtle.png';
import woodLongSprite from '../sprites/wood_long.png';
import woodShortSprite from '../sprites/wood_short.png';

interface ObstacleProps {
    data: ObstacleType;
    lanePositionY: number;
}

const obstacleSpriteMap: Record<string, string> = {
    CAR:       carSprite,
    TRUCK:     truckSprite,
    TURTLE:    turtleSprite,
    WOODLONG:  woodLongSprite,
    WOODSHORT: woodShortSprite,
};

const Obstacle: React.FC<ObstacleProps> = ({ data, lanePositionY }) => {
    const sprite = obstacleSpriteMap[data.type];
    return (
        <div
            style={{
                position:          'absolute',
                left:              data.x,
                top:               data.y - lanePositionY,
                width:             data.width,
                height:            data.height,
                backgroundImage:   sprite ? `url(${sprite})` : undefined,
                // backgroundColor:   'red',
                backgroundSize:    '100% 100%',
                backgroundRepeat:  'no-repeat',
                zIndex:            50,
                // filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
            }}
        />
    );
};

export default Obstacle;