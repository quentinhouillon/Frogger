export type Difficulty = 'easy' | 'normal' | 'hard';
export type GameMode   = 'single' | 'multi' | 'network';

export interface GameSettings {
    slotsCount: 3 | 4 | 5;
    difficulty: Difficulty;
    mode:       GameMode;
    musicVolume: number;        // 0 à 100
    sfxVolume:   number;        // 0 à 100
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

export interface ScoreBreakdown {
    lanePoints:    number;  // pts gagnés en avançant
    arrivalPoints: number;  // bonus d'arrivée (base + combo)
    timePoints:    number;  // bonus de temps cumulé
    livesPoints:   number;  // bonus de vies en fin de partie
    deathPenalty:  number;  // total des pénalités (valeur positive)
    deaths:        number;  // nombre de morts
    total:         number;  // score final
}

export interface GameState {
    screenWidth:    number;
    screenHeight:   number;
    score:          number;
    score2:         number;
    lifes:          number;
    lifes2:         number;
    maxLifes:       number;
    combo:          number;        // arrivées consécutives sans mort J1
    combo2:         number;        // arrivées consécutives sans mort J2
    timeLeft:       number;        // secondes restantes pour la traversée J1 (0-30)
    timeLeft2:      number;        // secondes restantes pour la traversée J2 (0-30)
    scoreBreakdown:  ScoreBreakdown | null;
    scoreBreakdown2: ScoreBreakdown | null;
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
    highScores:        HighScoreEntry[];
    waitingForPlayer2: boolean;
}
