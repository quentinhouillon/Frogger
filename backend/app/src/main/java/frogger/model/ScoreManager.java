package frogger.model;

/**
 * Responsable de toute la logique de score.
 * Suit la progression de la grenouille et attribue les points correctement.
 */
public class ScoreManager {

    private static final int POINTS_PER_LANE = 10;
    private static final int POINTS_ON_ARRIVAL = 50;
    private static final int LANE_HEIGHT = 50;

    private int score = 0;

    // Le Y le plus haut (petit) atteint par la grenouille lors de la tentative en cours.
    // Permet de ne marquer des points que si la grenouille avance réellement.
    private float maxYReached;
    private final float startY;

    public ScoreManager(float startY) {
        this.startY = startY;
        this.maxYReached = startY;
    }

    /**
     * Appelé à chaque frame avec la position Y actuelle de la grenouille.
     * Ajoute des points uniquement si elle progresse.
     */
    public void onFrogMoved(float currentY) {
        if (currentY < maxYReached) {
            int lanesProgressed = (int) ((maxYReached - currentY) / LANE_HEIGHT);
            score += lanesProgressed * POINTS_PER_LANE;
            maxYReached = currentY;
        }
    }

    /**
     * Appelé quand la grenouille atteint le sommet de la carte.
     */
    public void onFrogArrived() {
        score += POINTS_ON_ARRIVAL;
    }

    /**
     * Réinitialise le suivi de progression (à appeler après chaque mort ou arrivée).
     */
    public void onFrogRespawn() {
        maxYReached = startY;
    }

    public int getScore() {
        return score;
    }
}
