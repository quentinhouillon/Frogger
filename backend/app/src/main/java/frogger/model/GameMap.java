package frogger.model;

import java.util.ArrayList;


public class GameMap {
    public static final int SCREEN_WIDTH  = 1000;
    public static final int SCREEN_HEIGHT = 650;

    // Champs d'instance pour la sérialisation Gson (qui ignore les statiques)
    private final int screenWidth  = SCREEN_WIDTH;
    private final int screenHeight = SCREEN_HEIGHT;

    private final Frog             frog;
    private final ArrayList<Lane>  lanes;
    private final CollisionManager collisionManager;
    private final ScoreManager     scoreManager;

    public GameMap() {
        float startY = SCREEN_HEIGHT - 40f;
        frog             = new Frog(SCREEN_WIDTH / 2f - 20, startY, 40, 40);
        lanes            = LaneConfig.buildLanes(SCREEN_WIDTH);
        collisionManager = new CollisionManager();
        scoreManager     = new ScoreManager(startY);
    }

    public void update(float dt) {
        // 1. Mise à jour des obstacles (spawn + déplacement + nettoyage)
        for (Lane lane : lanes) {
            lane.manageObstacle(dt);
        }

        // 2. Déplacement de la grenouille
        frog.update(dt);

        // 3. Arrivée au sommet → score + respawn
        if (frog.getY() < 0) {
            scoreManager.onFrogArrived();
            respawnFrog();
            return;
        }

        // 4. Détection des collisions (route / rivière)
        boolean isDead = collisionManager.update(frog, lanes);
        if (isDead) {
            respawnFrog();
            return;
        }

        // 5. Score de progression
        scoreManager.onFrogMoved(frog.getY());

        // 6. Contraintes de l'écran
        constrainFrog();
    }


    private void respawnFrog() {
        frog.setX(SCREEN_WIDTH / 2f - 20);
        frog.setY(SCREEN_HEIGHT - frog.getHeight());
        frog.setState(Frog.FrogState.LIVING);
        frog.setDirection(0, 0);
        frog.setSpeed(frog.getBASE_SPEED());
        scoreManager.onFrogRespawn();
    }

    private void constrainFrog() {
        if (frog.getX() < 0) frog.setX(0);
        if (frog.getX() > SCREEN_WIDTH - frog.getWidth()) frog.setX(SCREEN_WIDTH - frog.getWidth());
        if (frog.getY() > SCREEN_HEIGHT - frog.getHeight()) frog.setY(SCREEN_HEIGHT - frog.getHeight());
    }


    public Frog            getFrog()         { return frog; }
    public ArrayList<Lane> getLanes()        { return lanes; }
    public int             getScore()        { return scoreManager.getScore(); }
    public int             getSCREEN_WIDTH()  { return SCREEN_WIDTH; }
    public int             getSCREEN_HEIGHT() { return SCREEN_HEIGHT; }
}
