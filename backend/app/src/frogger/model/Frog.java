package model;

public class Frog extends Entity {

    enum FrogState {
        LIVING,
        MOVING,
        DEAD,
        WIN
    }

    private FrogState state;

    public Frog(int x, int y, int width, int height) {
        super(x, y, width, height);
        this.state = FrogState.LIVING;
    }

    public void update(int dt) {

    }

    public FrogState getState() {
        return this.state;
    }
}
