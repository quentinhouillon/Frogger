package frogger.model;

public class Frog extends Entity {

    enum FrogState {
        LIVING,
        MOVING,
        DEAD,
        WIN
    }

    private FrogState state;

    public Frog(float x, float y, float width, float height) {
        super(x, y, width, height);
        this.state = FrogState.LIVING;
    }

    @Override
    public void update(float dt) {

    }

    public FrogState getState() {
        return this.state;
    }
}
