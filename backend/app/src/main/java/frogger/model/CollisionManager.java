package frogger.model;

import java.util.ArrayList;

/**
 * Gère toutes les collisions entre la grenouille et les obstacles.
 *
 * Route  → mort immédiate.
 * Rivière avec tronc/tortue → la grenouille dérive avec l'obstacle (drift).
 * Rivière sans tronc/tortue → noyade.
 */
public class CollisionManager {

    private static final int LANE_HEIGHT = 50;

    /**
     * @param dt delta time en secondes (nécessaire pour calculer la dérive du tronc)
     * @return true si la grenouille vient de mourir
     */
    public boolean update(Frog frog, ArrayList<Lane> lanes, float dt) {
        for (Lane lane : lanes) {
            boolean isSafeInRiver = false;

            for (Obstacle obstacle : lane.getObstacles()) {
                if (collides(frog, obstacle)) {
                    switch (lane.getLaneType()) {

                        case ROAD:
                            // Collision voiture/camion → mort
                            frog.setState(Frog.FrogState.DEAD);
                            return true;

                        case RIVER:
                            // Sur un tronc ou une tortue → dérive avec lui
                            isSafeInRiver = true;
                            float dirX = lane.getMovingDirection() == Lane.MovingDirection.RIGHT ? 1f : -1f;
                            frog.drift(dirX * lane.getSpeed() * dt);
                            break;

                        default:
                            break;
                    }
                }
            }

            // Dans la rivière mais aucun tronc/tortue sous la grenouille → noyade
            if (lane.getLaneType() == Lane.LaneType.RIVER && !isSafeInRiver) {
                float frogY = frog.getY();
                if (frogY >= lane.getPositionY() && frogY < lane.getPositionY() + LANE_HEIGHT) {
                    frog.setState(Frog.FrogState.DEAD);
                    return true;
                }
            }
        }

        return false;
    }

    /** AABB : détecte si la grenouille touche un obstacle. */
    private boolean collides(Frog frog, Obstacle obstacle) {
        return frog.getX()               < obstacle.getX() + obstacle.getWidth()  &&
               frog.getX() + frog.getWidth()  > obstacle.getX()                   &&
               frog.getY()               < obstacle.getY() + obstacle.getHeight() &&
               frog.getY() + frog.getHeight() > obstacle.getY();
    }
}
