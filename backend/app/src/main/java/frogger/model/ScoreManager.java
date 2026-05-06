package frogger.model;

/**
 * Responsable de toute la logique de score.
 *
 * Améliorations v2 :
 *   1. Bonus de vitesse   — chaque lane vaut (10 × speedMult) pts
 *   2. Pénalité de mort   — -30 pts par mort (plancher à 0)
 *   3. Combo d'arrivées   — +25 % par arrivée consécutive sans mourir
 *   4. Bonus de vies      — appelé par GameMap à la fin de partie
 *   5. Bonus de temps     — timer de 30 s par traversée ; chaque seconde
 *                           restante vaut TIME_BONUS_PER_SEC pts × speedMult
 */
public class ScoreManager {

    // ── Constantes ────────────────────────────────────────────────────────────
    private static final int   POINTS_PER_LANE      = 10;
    private static final int   POINTS_ON_ARRIVAL    = 50;
    private static final int   DEATH_PENALTY        = 30;
    private static final int   BONUS_PER_LIFE       = 100;
    private static final float COMBO_BONUS_RATE     = 0.25f;
    private static final int   LANE_HEIGHT          = 50;
    private static final float TIME_LIMIT           = 30f;
    private static final int   TIME_BONUS_PER_SEC   = 5;

    // ── Compteurs de score par catégorie (pour le récapitulatif) ─────────────
    private int lanePoints    = 0;  // points gagnés en avançant
    private int arrivalPoints = 0;  // bonus d'arrivée (base + combo)
    private int timePoints    = 0;  // bonus de temps accumulé
    private int livesPoints   = 0;  // bonus de vies en fin de partie
    private int deathPenalty  = 0;  // total des pénalités de mort (valeur positive)
    private int deaths        = 0;  // nombre de morts

    // ── État courant ──────────────────────────────────────────────────────────
    private int   score        = 0;
    private int   combo        = 0;
    private float timeLeft     = TIME_LIMIT;
    private float maxYReached;
    private final float startY;
    private final float speedMult;

    // ── Constructeurs ─────────────────────────────────────────────────────────
    public ScoreManager(float startY, float speedMult) {
        this.startY      = startY;
        this.speedMult   = speedMult;
        this.maxYReached = startY;
    }

    public ScoreManager(float startY) { this(startY, 1.0f); }

    // ── Boucle principale ─────────────────────────────────────────────────────
    public void update(float dt) {
        timeLeft = Math.max(0f, timeLeft - dt);
    }

    // ── Événements ────────────────────────────────────────────────────────────
    public void onFrogMoved(float currentY) {
        if (currentY < maxYReached) {
            int lanesProgressed = (int) ((maxYReached - currentY) / LANE_HEIGHT);
            if (lanesProgressed > 0) {
                int pts = Math.round(lanesProgressed * POINTS_PER_LANE * speedMult);
                score       += pts;
                lanePoints  += pts;
                maxYReached  = currentY;
            }
        }
    }

    public void onFrogArrived() {
        float comboMult   = 1f + combo * COMBO_BONUS_RATE;
        int   baseArrival = Math.round(POINTS_ON_ARRIVAL * speedMult * comboMult);
        int   timeBonus   = Math.round(timeLeft * TIME_BONUS_PER_SEC * speedMult);
        score         += baseArrival + timeBonus;
        arrivalPoints += baseArrival;
        timePoints    += timeBonus;
        combo++;
    }

    public void onFrogDied() {
        int penalty  = Math.min(score, DEATH_PENALTY);
        score        = Math.max(0, score - DEATH_PENALTY);
        deathPenalty += penalty;
        deaths++;
        combo        = 0;
        timeLeft     = TIME_LIMIT;
        maxYReached  = startY;
    }

    public void onFrogRespawn() {
        timeLeft    = TIME_LIMIT;
        maxYReached = startY;
    }

    public void onGameWon(int livesLeft) {
        int bonus  = livesLeft * BONUS_PER_LIFE;
        score     += bonus;
        livesPoints = bonus;
    }

    // ── Récapitulatif ─────────────────────────────────────────────────────────
    /**
     * Retourne un objet récap utilisé pour la sérialisation JSON.
     * Les valeurs reflètent les totaux accumulés sur toute la partie.
     */
    public ScoreBreakdown getBreakdown() {
        return new ScoreBreakdown(lanePoints, arrivalPoints, timePoints,
                                  livesPoints, deathPenalty, deaths, score);
    }

    // ── Getters ───────────────────────────────────────────────────────────────
    public int   getScore()    { return score;    }
    public int   getCombo()    { return combo;    }
    public float getTimeLeft() { return timeLeft; }

    // ── Classe interne sérialisable ───────────────────────────────────────────
    public static class ScoreBreakdown {
        public final int lanePoints;
        public final int arrivalPoints;
        public final int timePoints;
        public final int livesPoints;
        public final int deathPenalty;  // toujours positif, s'affiche en rouge
        public final int deaths;
        public final int total;

        public ScoreBreakdown(int lanePoints, int arrivalPoints, int timePoints,
                              int livesPoints, int deathPenalty, int deaths, int total) {
            this.lanePoints    = lanePoints;
            this.arrivalPoints = arrivalPoints;
            this.timePoints    = timePoints;
            this.livesPoints   = livesPoints;
            this.deathPenalty  = deathPenalty;
            this.deaths        = deaths;
            this.total         = total;
        }
    }
}
