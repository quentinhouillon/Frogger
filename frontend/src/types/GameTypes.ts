export type Difficulty = 'easy' | 'normal' | 'hard';

export interface GameSettings {
    slotsCount:  3 | 4 | 5;
    difficulty:  Difficulty;
}

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

export interface LilySlot {
    x: number;
    y: number;
    width: number;
    height: number;
    occupied: boolean;
}

export interface HighScoreEntry {
    score: number;
    date:  string;
}

export interface GameState {
    screenWidth: number;
    screenHeight: number;
    score: number;
    lifes: number;
    maxLifes: number;
    gameOver: boolean;
    gameWon:  boolean;
    frog: Frog;
    parkedFrogs: Frog[];
    lanes: Lane[];
    lilySlots: LilySlot[];
    highScores: HighScoreEntry[];
}