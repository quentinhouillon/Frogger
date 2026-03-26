export interface Entity {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Frog extends Entity {
    directionX: number;
    directionY: number;
    BASE_SPEED: number;
    speed: number;
    state: 'LIVING' | 'MOVING' | 'DEAD' | 'WIN';
}

export interface Obstacle extends Entity {
    type: 'CAR' | 'TRUCK' | 'TURTLE' | 'WOODLONG' | 'WOODSHORT' | 'WATERLILY' | 'NONE';
    speed: number;
    movingDirection: 'LEFT' | 'RIGHT';
}

export interface Lane {
    laneType: 'ROAD' | 'RIVER' | 'SAFE';
    positionY: number;
    obstacles: Obstacle[];
    speed: number;
    movingDirection: 'LEFT' | 'RIGHT';
    width: number;
}

export interface GameState {
    screenWidth: number;
    screenHeight: number;
    score: number;
    frog: Frog;
    lanes: Lane[];
}