package frogger.model;

public class Obstacle extends Entity {

    public enum ObstacleType {
        CAR,
        BUS,
        TURTLE,
        ALLIGATOR,
        WATERLILY
    }

    private final ObstacleType type;
    private final int speed;
    private final Lane.MovingDirection movingDirection;


    public Obstacle(float x, float y, int width, int height, ObstacleType type, int speed, Lane.MovingDirection movingDirection) {
        super(x, y, width, height);
        this.type = type;
        this.speed = speed;
        this.movingDirection = movingDirection;
    }

    public void update(float dt) {
        if (this.type != ObstacleType.WATERLILY) {
            if (this.movingDirection == Lane.MovingDirection.RIGHT) {
                super.setX(super.getX() + this.speed * dt);
            } else {
                super.setX(super.getX() - this.speed * dt);
            }
        }
    }

    public ObstacleType getType() {
        return type;
    }
}
