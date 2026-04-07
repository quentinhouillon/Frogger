export interface Entity {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Frog extends Entity {
    state: 'LIVING' | 'DEAD' | 'WIN';
}

export interface Obstacle extends Entity {
    type: 'CAR' | 'TRUCK' | 'TURTLE' | 'WOODLONG' | 'WOODSHORT' | 'WATERLITY' | 'NONE';
    speed: number;
    movingDirection: 'LEFT' | 'RIGHT';
}

export interface Lane {
    laneType: 'ROAD' | 'RIVER' | 'SAFE' | 'WATERLITY_BUSH';
    positionY: number;
    speed: number;
    movingDirection: 'LEFT' | 'RIGHT';
    obstacles: Obstacle[];
    width: number;
}

export interface GameState {
    screenWidth: number;
    screenHeight: number;
    score: number;
    lifes: number;
    maxLifes: number;
    frog: Frog;
    frogs: Frog[];
    lanes: Lane[];
}