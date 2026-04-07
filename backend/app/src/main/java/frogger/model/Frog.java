package frogger.model;


public class Frog extends Entity {

    public static final int JUMP_SIZE = 50;

    public enum FrogState {
        LIVING,
        DEAD,
        WIN
    }

    private FrogState state;

    public Frog(float x, float y, int width, int height) {
        super(x, y, width, height);
        this.state = FrogState.LIVING;
    }

    public void jump(int dx, int dy) {
        if (state != FrogState.LIVING) return;
        super.setX(super.getX() + dx * JUMP_SIZE);
        super.setY(super.getY() + dy * JUMP_SIZE);
    }

    public void drift(float driftX) {
        if (state != FrogState.LIVING) return;
        super.setX(super.getX() + driftX);
    }

    public FrogState getState()           { return state; }
    public void      setState(FrogState s){ this.state = s; }
}
