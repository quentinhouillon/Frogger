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
    type: 'CAR' | 'BUS' | 'TURTLE' | 'ALLIGATOR';
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
    SCREEN_WIDTH: number;
    SCREEN_HEIGHT: number;
    score: number;
    frog: Frog;
    lanes: Lane[];
}