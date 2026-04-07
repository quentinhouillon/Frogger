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
    type: 'CAR' | 'TRUCK' | 'TURTLE' | 'WOODLONG' | 'WOODSHORT' | 'WATERLILY' | 'NONE';
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
    frog: Frog;
    lanes: Lane[];
    score: number;
    lifes: number;
    maxLifes: number;
    screenWidth: number;
    screenHeight: number;
}