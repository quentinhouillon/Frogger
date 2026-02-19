package frogger.model;

public class Obstacle extends Entity {

    enum ObstacleType {
        CAR,
        LOG,
        TURTLE,
        ALLIGATOR
    }

    private ObstacleType type;

    public Obstacle(float x, float y, float width, float height, ObstacleType type) {
        super(x, y, width, height);
        this.type = type;
    }

    @Override
    public void update(float dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    public ObstacleType getType() {
        return type;
    }
}
