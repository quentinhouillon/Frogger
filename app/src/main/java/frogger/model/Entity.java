package frogger.model;

public abstract class Entity {
    protected float x, y;
    protected float width, height;
    protected float vx, vy;

    public Entity(float x, float y, float width, float height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public abstract void update(float dt);

    public float getX() { return x; }
    public void setX(float x) { this.x = x; }
    public float getY() { return y; }
    public void setY(float y) { this.y = y; }
    public float getWidth() { return width; }
    public float getHeight() { return height; }
    public void setVelocity(float vx, float vy) { this.vx = vx; this.vy = vy; }
}

