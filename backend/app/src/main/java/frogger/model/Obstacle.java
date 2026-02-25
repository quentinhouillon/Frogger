package frogger.model;

public class Obstacle extends Entity {

    enum ObstacleType {
        CAR,
        BUS,
        TURTLE,
        ALLIGATOR
    }

    private ObstacleType type;

    public Obstacle(int x, int y, int width, int height, ObstacleType type) {
        super(x, y, width, height);
        this.type = type;
    }

    public void update(int newX) {
        super.setx(newX);
    }

    public ObstacleType getType() {
        return type;
    }
}
