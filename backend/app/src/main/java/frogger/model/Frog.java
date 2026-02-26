package frogger.model;

public class Frog extends Entity {

    private final float BASE_SPEED = 250f;
    private float speed = BASE_SPEED;

    private float directionX = 0f;
    private float directionY = 0f;

    enum FrogState {
        LIVING,
        MOVING,
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

            float moveX = directionX * speed * dt;
            float moveY = directionY * speed * dt;

            super.setX(super.getX() + moveX);
            super.setY(super.getY() + moveY);
        }
    }

    public void setDirection(float dx, float dy) {
        this.directionX = dx;
        this.directionY = dy;
    }

    public float getBASE_SPEED() {
        return BASE_SPEED;
    }

    public void setSpeed(float speed) {
        this.speed = speed;
    }

    public float getSpeed() {
        return this.speed;
    }

    public FrogState getState() {
        return this.state;
    }

    public void setState(FrogState state) {
        this.state = state;
    }
}
