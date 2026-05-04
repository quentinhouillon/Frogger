export type Difficulty = 'easy' | 'normal' | 'hard';
export type GameMode   = 'single' | 'multi' | 'network';

export interface GameSettings {
    slotsCount: 3 | 4 | 5;
    difficulty: Difficulty;
    mode:       GameMode;
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
    screenWidth:    number;
    screenHeight:   number;
    score:          number;
    lifes:          number;
    maxLifes:       number;
    gameOver:       boolean;
    gameWon:        boolean;
    multiplayerMode: boolean;
    winner:         number;        // 0=aucun, 1=J1, 2=J2
    frog:           Frog;
    frog2:          Frog | null;
    parkedFrogs:    Frog[];
    parkedFrogs2:   Frog[] | null;
    lanes:          Lane[];
    lilySlots:      LilySlot[];
    lilySlots2:     LilySlot[] | null;
    score2:         number;
    lifes2:         number;
    highScores:        HighScoreEntry[];
    waitingForPlayer2: boolean;
}
