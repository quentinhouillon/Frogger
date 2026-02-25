package frogger.model;

import java.util.ArrayList;
import java.util.List;

public class Lane {

    private boolean hasObstacle;
    private boolean passed; 
    private List<Obstacle> obstacles;

    // 🔹 Constructeur
    public Lane(boolean hasObstacle) {
        this.hasObstacle = hasObstacle;
        this.passed = false; 
        this.obstacles = new ArrayList<>();
    }

    // 🔹 Getters
    public boolean hasObstacle() {
        return hasObstacle;
    }

    public boolean isPassed() {
        return passed;
    }

    public List<Obstacle> getObstacles() {
        return obstacles;
    }

    // 🔹 Setters
    public void setHasObstacle(boolean hasObstacle) {
        this.hasObstacle = hasObstacle;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    // 🔹 Ajouter un obstacle
    public void addObstacle(Obstacle obstacle) {
        if (hasObstacle) {
            obstacles.add(obstacle);
        }
    }

    // 🔹 Déplacer les obstacles
    public void moveObstacles(int dt) {
        for (Obstacle obstacle : obstacles) {
            obstacle.update(dt);
        }
    }
}
