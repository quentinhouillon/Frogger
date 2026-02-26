package frogger.model;

import java.util.ArrayList;

public class GameMap {
    public static final int SCREEN_WIDTH = 600;
    public static final int SCREEN_HEIGHT = 600;

    private Frog frog;
    private ArrayList<Lane> lanes;
    private int score = 0;

    public GameMap() {
        frog = new Frog(SCREEN_WIDTH / 2 - 20, SCREEN_HEIGHT, 40, 40);
        lanes = new ArrayList<>();

        initLanes();
    }

    private void initLanes() {
        lanes.add(new Lane(Lane.LaneType.SAFE, 600, Lane.MovingDirection.RIGHT, 100, SCREEN_WIDTH));
        lanes.add(new Lane(Lane.LaneType.ROAD, 500, Lane.MovingDirection.RIGHT, 100, SCREEN_WIDTH));
        lanes.add(new Lane(Lane.LaneType.RIVER, 400, Lane.MovingDirection.LEFT, 150, SCREEN_WIDTH));
        lanes.add(new Lane(Lane.LaneType.ROAD, 300, Lane.MovingDirection.RIGHT, 100, SCREEN_WIDTH));
        lanes.add(new Lane(Lane.LaneType.RIVER, 200, Lane.MovingDirection.LEFT, 150, SCREEN_WIDTH));
        lanes.add(new Lane(Lane.LaneType.ROAD, 100, Lane.MovingDirection.RIGHT, 100, SCREEN_WIDTH));
    }

    public void update(float dt) {
        frog.update(dt);

        if (frog.getY() < 0) {
            score += 10;
            respawnFrog();
        }

        for (Lane lane : lanes) {
            lane.manageObstacle(dt);

            boolean isSafeInRiver = false;

            // 2. On vérifie tous les obstacles de la ligne
            for (Obstacle obstacle : lane.getObstacles()) {

                if (checkCollision(frog, obstacle)) {
                    // CAS 1 : Collision sur la ROUTE -> MORT
                    if (lane.getLaneType() == Lane.LaneType.ROAD) {
                        frog.setState(Frog.FrogState.DEAD);
                        respawnFrog();
                    }
                    // CAS 2 : Collision sur la RIVIÈRE -> SAUVÉ (On monte sur le tronc)
                    else if (lane.getLaneType() == Lane.LaneType.RIVER) {
                        isSafeInRiver = true; // On a trouvé un tronc !

                        // Logique de déplacement sur le tronc
                        frog.setDirection(lane.getMovingDirection() == Lane.MovingDirection.RIGHT ? 1 : -1, 0);
                        if (frog.getState() != Frog.FrogState.MOVING) {
                            frog.setSpeed(lane.getSpeed());
                        }
                    }
                }
            }

            // 3. Verdict pour la RIVIÈRE (Une fois qu'on a vérifié tous les obstacles)
            // Si on est dans une rivière ET qu'on n'a touché aucun tronc -> NOYADE
            if (lane.getLaneType() == Lane.LaneType.RIVER && !isSafeInRiver) {
                // Vérifie si la grenouille est bien DANS cette ligne (en Y)
                // C'est important, sinon elle meurt même si elle est sur l'herbe !
                if (frog.getY() >= lane.getPositionY() && frog.getY() < lane.getPositionY() + 50) {
                    frog.setState(Frog.FrogState.DEAD);
                    respawnFrog();
                }
            }

            // for (Obstacle obstacle : lane.getObstacles()) {
            // if (checkCollision(frog, obstacle)) {
            // if (lane.getLaneType() == Lane.LaneType.ROAD) {
            // frog.setState(Frog.FrogState.DEAD);
            // respawnFrog();
            // }
            // else if (lane.getLaneType() == Lane.LaneType.RIVER) {
            // frog.setDirection(lane.getMovingDirection() == Lane.MovingDirection.RIGHT ? 1
            // : -1, 0);
            // if(frog.getState() != Frog.FrogState.MOVING) {
            // frog.setSpeed(lane.getSpeed());
            // } else {
            // frog.setSpeed(frog.getBASE_SPEED());
            // }
            // }
            // } else {
            // if(lane.getLaneType() == Lane.LaneType.RIVER) {
            // frog.setState(Frog.FrogState.DEAD);
            // respawnFrog();
            // }
            // }
            // }
        }

        constrainFrog();
    }

    private boolean checkCollision(Frog frog, Obstacle obstacle) {
        return frog.getX() < obstacle.getX() + obstacle.getWidth() &&
                frog.getX() + frog.getWidth() > obstacle.getX() &&
                frog.getY() < obstacle.getY() + obstacle.getHeight() &&
                frog.getY() + frog.getHeight() > obstacle.getY();
    }

    private void respawnFrog() {
        frog.setX(SCREEN_WIDTH / 2 - 20);
        frog.setY(SCREEN_HEIGHT - frog.getHeight());
    }

    private void constrainFrog() {
        // Gauche
        if (frog.getX() < 0) {
            frog.setX(0);
        }
        // Droite
        if (frog.getX() > SCREEN_WIDTH - frog.getWidth()) {
            frog.setX(SCREEN_WIDTH - frog.getWidth());
        }
        // Bas
        if (frog.getY() > SCREEN_HEIGHT - frog.getHeight()) {
            frog.setY(SCREEN_HEIGHT - frog.getHeight());
        }
        // Haut
        if (frog.getY() < 0) {
            frog.setY(0);
        }
    }

    public Frog getFrog() {
        return frog;
    }

    public ArrayList<Lane> getLanes() {
        return lanes;
    }

    public int getScore() {
        return score;
    }
}
