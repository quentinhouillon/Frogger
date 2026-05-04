package frogger.model;

public class LilySlot extends Entity {
    private boolean occupied;

    public LilySlot(float x, float y, int width, int height) {
        super(x, y, width, height);
        this.occupied = false;
    }

    public boolean isOccupied()              { return occupied; }
    public void    setOccupied(boolean v)    { occupied = v; }
}