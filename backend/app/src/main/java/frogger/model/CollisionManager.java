package frogger.model;

import java.util.ArrayList;

public class CollisionManager {

    private static final int LANE_HEIGHT = 50;

    public enum CollisionResult { NONE, DEAD, LILY_LANDED }

    public CollisionResult update(Frog frog, ArrayList<Lane> lanes, ArrayList<LilySlot> lilySlots, float dt) {

        // ── Zone nénuphars (y en [0, 50)) ──────────────────────────────────
        if (frog.getY() >= 0 && frog.getY() < LANE_HEIGHT) {
            for (LilySlot slot : lilySlots) {
                if (collidesX(frog, slot)) {
                    if (slot.isOccupied()) {
                        frog.setState(Frog.FrogState.DEAD);
                        return CollisionResult.DEAD;
                    }
                    return CollisionResult.LILY_LANDED;
                }
            }
            // Dans la lane mais pas sur un nénuphar → buisson → mort
            frog.setState(Frog.FrogState.DEAD);
            return CollisionResult.DEAD;
        }

        // ── Routes & rivières ───────────────────────────────────────────────
        for (Lane lane : lanes) {
            if (lane.getLaneType() == Lane.LaneType.SAFE
                    || lane.getLaneType() == Lane.LaneType.WATERLITY_BUSH) continue;

            boolean isSafeInRiver = false;

            for (Obstacle obstacle : lane.getObstacles()) {
                if (collides(frog, obstacle)) {
                    if (lane.getLaneType() == Lane.LaneType.ROAD) {
                        frog.setState(Frog.FrogState.DEAD);
                        return CollisionResult.DEAD;
                    }
                    if (lane.getLaneType() == Lane.LaneType.RIVER) {
                        isSafeInRiver = true;
                        float dirX = lane.getMovingDirection() == Lane.MovingDirection.RIGHT ? 1f : -1f;
                        float newX  = frog.getX() + dirX * lane.getSpeed() * dt;
                        // La bûche entraîne la grenouille hors du canvas → elle tombe
                        if (newX < 0 || newX + frog.getWidth() > GameMap.SCREEN_WIDTH) {
                            frog.setState(Frog.FrogState.DEAD);
                            return CollisionResult.DEAD;
                        }
                        frog.drift(dirX * lane.getSpeed() * dt);
                    }
                }
            }

            if (lane.getLaneType() == Lane.LaneType.RIVER && !isSafeInRiver) {
                if (isFrogInLane(frog, lane)) {
                    frog.setState(Frog.FrogState.DEAD);
                    return CollisionResult.DEAD;
                }
            }
        }

        return CollisionResult.NONE;
    }

    private boolean isFrogInLane(Frog frog, Lane lane) {
        float y = frog.getY();
        return y >= lane.getPositionY() && y < lane.getPositionY() + LANE_HEIGHT;
    }

    private boolean collides(Frog frog, Obstacle obs) {
        return frog.getX()              < obs.getX() + obs.getWidth()  &&
               frog.getX() + frog.getWidth()  > obs.getX()             &&
               frog.getY()              < obs.getY() + obs.getHeight() &&
               frog.getY() + frog.getHeight() > obs.getY();
    }

    /** Collision horizontale uniquement (pour les lily slots qui couvrent toute la hauteur de lane). */
    private boolean collidesX(Frog frog, LilySlot slot) {
        return frog.getX()             < slot.getX() + slot.getWidth() &&
               frog.getX() + frog.getWidth() > slot.getX();
    }
}
