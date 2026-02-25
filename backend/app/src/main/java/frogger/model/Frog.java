package frogger.model;

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

    public void update(int newX, int newY) {
        if (state == FrogState.LIVING) {
            this.x = newX;
            this.y = newY;
            state = FrogState.MOVING;
        }
    }

    public FrogState getState() {
        return this.state;
    }

    public void setState(FrogState state) {
        this.state = state;
    }
}
