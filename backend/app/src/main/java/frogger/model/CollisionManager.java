package frogger.model;

import java.util.ArrayList;

/**
 * Responsable de la détection et de la résolution des collisions.
 * Décide si la grenouille meurt, se laisse porter, ou se noie.
 */
public class CollisionManager {

    private static final int LANE_HEIGHT = 50;

    /**
     * Vérifie toutes les collisions entre la grenouille et les obstacles de chaque lane.
     * Modifie directement l'état de la grenouille selon le résultat.
     *
     * @return true si la grenouille vient de mourir (pour que GameMap puisse la faire respawn)
     */
    public boolean update(Frog frog, ArrayList<Lane> lanes) {
        for (Lane lane : lanes) {
            boolean isSafeInRiver = false;

            for (Obstacle obstacle : lane.getObstacles()) {
                if (collides(frog, obstacle)) {
                    switch (lane.getLaneType()) {

                        case ROAD:
                            // Collision avec une voiture → mort immédiate
                            frog.setState(Frog.FrogState.DEAD);
                            return true;

                        case RIVER:
                            // Collision avec un tronc/tortue → on se laisse porter
                            isSafeInRiver = true;
                            float dirX = lane.getMovingDirection() == Lane.MovingDirection.RIGHT ? 1f : -1f;
                            frog.setDirection(dirX, 0);
                            if (frog.getState() != Frog.FrogState.MOVING) {
                                frog.setSpeed(lane.getSpeed());
                            }
                            break;

                        default:
                            break;
                    }
                }
            }

            // Rivière sans tronc sous la grenouille → noyade
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

    /**
     * AABB (Axis-Aligned Bounding Box) : détecte si deux entités se chevauchent.
     */
    private boolean collides(Frog frog, Obstacle obstacle) {
        return frog.getX()              < obstacle.getX() + obstacle.getWidth()  &&
               frog.getX() + frog.getWidth()  > obstacle.getX()                   &&
               frog.getY()              < obstacle.getY() + obstacle.getHeight() &&
               frog.getY() + frog.getHeight() > obstacle.getY();
    }
}
