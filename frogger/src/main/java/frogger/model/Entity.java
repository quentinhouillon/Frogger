package frogger.model;

public abstract class Entity {
    private int coordonneeX;
    private int coordonneeY;
    private int width;
    private int height;

    public Entity(int coordonneeX, int coordonneeY, int width, int height, String assetPicture) {
        coordonneeX = this.coordonneeX;
        coordonneeY = this.coordonneeY;
        width = this.width;
        height = this.height;
    }

    public int getCoordonneeX() {
        return coordonneeX;
    }

    public void setCoordonneeX(int coordonneeX) {
        this.coordonneeX = coordonneeX;
    }

    public int getCoordonneeY() {
        return coordonneeY;
    }

    public void setCoordonneeY(int coordonneeY) {
        this.coordonneeY = coordonneeY;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }
}
