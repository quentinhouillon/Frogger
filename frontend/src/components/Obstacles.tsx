import React from 'react';
import type { Obstacle as ObstacleType } from "../types/GameTypes";

import carSprite from '../sprites/car_yellow.png';
import truckSprite from '../sprites/truck_red.png';
import turtleSprite from '../sprites/turtle.png';
import woodLongSprite from '../sprites/wood_long.png';
import woodShortSprite from '../sprites/wood_short.png';
import waterlitySprite from '../sprites/tile_nenuphar_bush.png';

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
    WATERLITY: waterlitySprite
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
                backgroundImage:    sprite ? `url(${sprite})` : undefined,
                backgroundSize:     'contain',
                backgroundRepeat:   'no-repeat',
                backgroundPosition: 'center',
                border:             '1px solid red',
                zIndex:             50,
            }}
        />
    );
};

export default Obstacle;