package frogger.model;

public class Frog extends Entity {

    enum FrogState {
        LIVING,
        DEAD,
        WIN
    }

    private FrogState state;

    public Frog(float x, float y, int width, int height) {
        super(x, y, width, height);
        this.state = FrogState.LIVING;
    }

    public void update(float dt) {
        if (state == FrogState.LIVING) {
            super.setX(super.getX() + 100 * dt);
            super.setY(super.getY() - 100 * dt);
        }
    }

    public FrogState getState() {
        return this.state;
    }

    public void setState(FrogState state) {
        this.state = state;
    }
}
