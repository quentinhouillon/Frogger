package frogger.model;

import java.util.ArrayList;

public class Lane {

    public enum LaneType {
        ROAD, RIVER, SAFE
    }

    public enum MovingDirection {
        LEFT, RIGHT
    }

    private final LaneType laneType;
    private boolean passed = false;
    private ArrayList<Obstacle> obstacles;
    private final int positionY;
    private final int speed;
    private final MovingDirection movingDirection;
    private final int width;
    private final Obstacle.ObstacleType obstacleType;

    private float timeSinceLastObstacle = 0f;
    private static final int LANE_HEIGHT = 50;

    /**
     * Calcule l'intervalle de spawn pour maintenir un espacement en pixels constant.
     * Formule : (gap_cible_px + largeur_obstacle) / vitesse
     * → indépendant de la vitesse et de la taille de l'obstacle.
     */
    private float getSpawnInterval() {
        if (this.speed == 0) return Float.MAX_VALUE;
        // Rivière : gap plus court pour que les troncs soient plus accessibles
        // Route  : gap plus long pour laisser du temps à la grenouille
        int targetGapPx = this.laneType == LaneType.RIVER ? 120 : 220;
        return (float)(targetGapPx + getObstacleWidth()) / this.speed;
    }

    // ── Tailles réelles par type d'obstacle ─────────────────────────────────
    // Chaque type a un ratio cohérent avec son sprite.
    // La hauteur est uniforme (40px) pour s'insérer proprement dans une lane de 50px.
    private int getObstacleWidth() {
        switch (this.obstacleType) {
            case WOODLONG:  return 200;
            case WOODSHORT: return 110;
            case TRUCK:     return 110;
            case CAR:       return  65;
            case TURTLE:    return  80;
            default:        return  60;
        }
    }

    private int getObstacleHeight() {
        return 40;
    }

    public Lane(LaneType laneType, int positionY, MovingDirection movingDirection, int speed, int width, Obstacle.ObstacleType obstacleType) {
        this.laneType        = laneType;
        this.positionY       = positionY;
        this.movingDirection = movingDirection;
        this.speed           = speed;
        this.width           = width;
        this.obstacleType    = obstacleType;
        this.obstacles       = new ArrayList<>();

        // Pré-remplissage de la lane pour qu'il y ait des obstacles dès le départ.
        // Sans ça, la rivière est vide les 3 premières secondes → mort immédiate.
        initObstacles();
    }

    /**
     * Place 3 obstacles répartis uniformément sur la lane au démarrage.
     * Ils ont déjà leur vitesse et direction, donc ils se déplacent normalement.
     */
    private void initObstacles() {
        if (this.laneType == LaneType.SAFE) return;

        int obsW = getObstacleWidth();
        int obsH = getObstacleHeight();
        int y    = this.positionY + (LANE_HEIGHT - obsH) / 2;

        int spacing = this.width / 3;
        for (int i = 0; i < 3; i++) {
            float x = i * spacing + (spacing / 4f);
            obstacles.add(new Obstacle(x, y, obsW, obsH, this.obstacleType, this.speed, this.movingDirection));
        }
    }

    public void manageObstacle(float dt) {
        if (this.laneType == LaneType.SAFE) return;

        // Déplacement de tous les obstacles existants
        for (Obstacle obstacle : this.obstacles) {
            obstacle.update(dt);
        }

        // Spawn d'un nouvel obstacle à intervalle régulier
        this.timeSinceLastObstacle += dt;
        if (this.timeSinceLastObstacle >= getSpawnInterval()) {
            this.timeSinceLastObstacle = 0f;
            int obsW    = getObstacleWidth();
            int obsH    = getObstacleHeight();
            float spawnX = this.movingDirection == MovingDirection.RIGHT ? -obsW : this.width;
            int centeredY = this.positionY + (LANE_HEIGHT - obsH) / 2;
            this.obstacles.add(new Obstacle(spawnX, centeredY, obsW, obsH, this.obstacleType, this.speed, this.movingDirection));
        }

        // Suppression des obstacles sortis de l'écran
        obstacles.removeIf(obstacle -> obstacle.getX() > this.width || obstacle.getX() + obstacle.getWidth() < 0);
    }

    public LaneType getLaneType()         { return laneType; }
    public MovingDirection getMovingDirection() { return movingDirection; }
    public int getSpeed()                 { return speed; }
    public int getPositionY()             { return positionY; }
    public boolean getIsPassed()          { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }
    public ArrayList<Obstacle> getObstacles() { return obstacles; }
}
