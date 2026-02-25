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

    public void update(float dt) {
        frog.update(dt);

        lanes.add(new Lane(Lane.LaneType.SAFE, 500, Lane.MovingDirection.RIGHT, 100, SCREEN_WIDTH));
        lanes.add(new Lane(Lane.LaneType.ROAD, 500, Lane.MovingDirection.RIGHT, 100, SCREEN_WIDTH));
        lanes.add(new Lane(Lane.LaneType.RIVER, 400, Lane.MovingDirection.LEFT, 150, SCREEN_WIDTH));
        lanes.add(new Lane(Lane.LaneType.ROAD, 300, Lane.MovingDirection.RIGHT, 100, SCREEN_WIDTH));
        


        if (frog.getY() < 0) {
            score += 10;
            respawnFrog();
        }

        for (Lane lane : lanes) {
            lane.manageObstacle(dt);
            for (Obstacle obstacle : lane.getObstacles()) {
                if (checkCollision(frog, obstacle)) {
                    frog.setState(Frog.FrogState.DEAD);
                    respawnFrog();
                }
            }
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
        frog.setY(SCREEN_HEIGHT);
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

}
