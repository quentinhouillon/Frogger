package frogger.model;

import java.util.ArrayList;

public class LaneConfig {

    public static ArrayList<Lane> buildLanes(int screenWidth) {
        ArrayList<Lane> lanes = new ArrayList<>();

        // ── Zone de départ ────────────────────────────────────── y=600
        lanes.add(new Lane(Lane.LaneType.SAFE, 600, Lane.MovingDirection.RIGHT, 0, screenWidth,
                Obstacle.ObstacleType.NONE));

        // ── Route (5 lanes) ──────────────────────────────────── y=550..350
        lanes.add(new Lane(Lane.LaneType.ROAD, 550, Lane.MovingDirection.LEFT, 150, screenWidth,
                Obstacle.ObstacleType.CAR));
        lanes.add(new Lane(Lane.LaneType.ROAD, 500, Lane.MovingDirection.RIGHT, 200, screenWidth,
                Obstacle.ObstacleType.CAR));
        lanes.add(new Lane(Lane.LaneType.ROAD, 450, Lane.MovingDirection.LEFT, 80, screenWidth,
                Obstacle.ObstacleType.TRUCK));
        lanes.add(new Lane(Lane.LaneType.ROAD, 400, Lane.MovingDirection.RIGHT, 180, screenWidth,
                Obstacle.ObstacleType.CAR));
        lanes.add(new Lane(Lane.LaneType.ROAD, 350, Lane.MovingDirection.LEFT, 130, screenWidth,
                Obstacle.ObstacleType.CAR));

        // ── Zone médiane ─────────────────────────────────────── y=300
        lanes.add(new Lane(Lane.LaneType.SAFE, 300, Lane.MovingDirection.RIGHT, 0, screenWidth,
                Obstacle.ObstacleType.NONE));

        // ── Rivière (5 lanes) ────────────────────────────────── y=250..50
        lanes.add(new Lane(Lane.LaneType.RIVER, 250, Lane.MovingDirection.RIGHT, 60, screenWidth,
                Obstacle.ObstacleType.WOODLONG));
        lanes.add(new Lane(Lane.LaneType.RIVER, 200, Lane.MovingDirection.LEFT, 140, screenWidth,
                Obstacle.ObstacleType.TURTLE));
        lanes.add(new Lane(Lane.LaneType.RIVER, 150, Lane.MovingDirection.RIGHT, 160, screenWidth,
                Obstacle.ObstacleType.WOODLONG));
        lanes.add(new Lane(Lane.LaneType.RIVER, 100, Lane.MovingDirection.LEFT, 80, screenWidth,
                Obstacle.ObstacleType.WOODSHORT));
        lanes.add(new Lane(Lane.LaneType.RIVER, 50, Lane.MovingDirection.RIGHT, 100, screenWidth,
                Obstacle.ObstacleType.TURTLE));

        // ── Zone d'arrivée (nénuphars) ───────────────────────── y=0
        lanes.add(new Lane(Lane.LaneType.WATERLITY_BUSH, 0, Lane.MovingDirection.RIGHT, 0, screenWidth,
                Obstacle.ObstacleType.WATERLILY));

        return lanes;
    }
}
