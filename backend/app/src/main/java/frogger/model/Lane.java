package frogger.model;

import java.util.ArrayList;

public class Lane {

    public enum LaneType {
        ROAD, RIVER, SAFE
    }

    public enum MovingDirection {
        LEFT, RIGHT
    }

    private final LaneType laneType;
    private boolean passed = false;
    private ArrayList<Obstacle> obstacles;
    private final int positionY;
    private final int speed;
    private final MovingDirection movingDirection;
    private final int width;
    private final Obstacle.ObstacleType obstacleType;

    private float timeSinceLastObstacle = 0f;
    private static final float OBSTACLE_SPAWN_INTERVAL = 2f;

    public Lane(LaneType laneType, int positionY, MovingDirection movingDirection, int speed, int width, Obstacle.ObstacleType obstacleType) {
        this.laneType = laneType;
        this.positionY = positionY;
        this.movingDirection = movingDirection;
        this.speed = speed;
        this.width = width;
        this.obstacleType = obstacleType;
        this.obstacles = new ArrayList<>();
    }

    public LaneType getLaneType() {
        return laneType;
    }

    public MovingDirection getMovingDirection() {
        return movingDirection;
    }

    public int getSpeed() {
        return speed;
    }

    public int getPositionY() {
        return positionY;
    }

    public boolean getIsPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public ArrayList<Obstacle> getObstacles() {
        return obstacles;
    }

    public void manageObstacle(float dt) {
        if (this.laneType == LaneType.SAFE) return;

        // Déplacement de tous les obstacles existants
        for (Obstacle obstacle : this.obstacles) {
            obstacle.update(dt);
        }

        // Spawn d'un nouvel obstacle à intervalle régulier
        this.timeSinceLastObstacle += dt;
        if (this.timeSinceLastObstacle >= OBSTACLE_SPAWN_INTERVAL) {
            this.timeSinceLastObstacle = 0f;
            float spawnX = this.movingDirection == MovingDirection.RIGHT ? -50 : this.width;
            this.obstacles.add(new Obstacle(spawnX, this.positionY + 10, 50, 30, this.obstacleType, this.speed, this.movingDirection));
        }

        // Suppression des obstacles sortis de l'écran
        obstacles.removeIf(obstacle -> obstacle.getX() > this.width || obstacle.getX() + obstacle.getWidth() < 0);
    }
}
