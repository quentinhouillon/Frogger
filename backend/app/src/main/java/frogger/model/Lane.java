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

    private float timeSinceLastObstacle = 0f;
    private static final float OBSTACLE_SPAWN_INTERVAL = 2f;

    public Lane(LaneType laneType, int positionY, MovingDirection movingDirection, int speed, int width) {
        this.laneType = laneType;
        this.positionY = positionY;
        this.movingDirection = movingDirection;
        this.speed = speed;
        this.width = width;
        this.obstacles = new ArrayList<>();
    }

    public LaneType getLaneType() {
        return laneType;
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
        if (this.laneType != LaneType.SAFE) {
            this.timeSinceLastObstacle += dt;
            if (this.timeSinceLastObstacle >= OBSTACLE_SPAWN_INTERVAL) {
                this.timeSinceLastObstacle = 0f;
                this.obstacles.add(new Obstacle(this.movingDirection == MovingDirection.RIGHT ? 0 : this.width, this.positionY, 50, 50, Obstacle.ObstacleType.CAR, this.speed, this.movingDirection));
            }

            obstacles.removeIf(obstacle -> obstacle.getX() > this.width || obstacle.getX() + obstacle.getWidth() < 0);
        }
    }
}
