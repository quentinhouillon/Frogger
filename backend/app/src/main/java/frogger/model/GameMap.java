package frogger.model;

import java.util.ArrayList;

public class GameMap {
    public static final int  SCREEN_WIDTH  = 1000;
    public static final int  SCREEN_HEIGHT = 650;
    private static final int LANE_HEIGHT   = 50;
    private static final int MAX_LIFES     = 3;

    private final int screenWidth  = SCREEN_WIDTH;
    private final int screenHeight = SCREEN_HEIGHT;

    private Frog                         frog;
    private final ArrayList<Lane>        lanes;
    private final CollisionManager       collisionManager;
    private final ScoreManager           scoreManager;
    private final int                    maxLifes;
    private int                          score;
    private int                          lifes;
    private boolean                      gameOver;
    private boolean                      gameWon;
    private final ArrayList<LilySlot>    lilySlots;
    private final ArrayList<Frog>        parkedFrogs;
    private ArrayList<HighScoreEntry>    highScores;

    public GameMap(int slotsCount, float speedMult) {
        float startY     = SCREEN_HEIGHT - 40f;
        frog             = new Frog(SCREEN_WIDTH / 2f - 20, startY, 40, 40);
        lanes            = LaneConfig.buildLanes(SCREEN_WIDTH, speedMult);
        collisionManager = new CollisionManager();
        scoreManager     = new ScoreManager(startY);
        score            = 0;
        lifes            = MAX_LIFES;
        maxLifes         = MAX_LIFES;
        gameOver         = false;
        gameWon          = false;
        lilySlots        = buildLilySlots(slotsCount);
        parkedFrogs      = new ArrayList<>();
        highScores       = new ArrayList<>(HighScoreRepository.load());
    }

    /** Constructeur par défaut : 5 slots, vitesse normale. */
    public GameMap() {
        this(5, 1.0f);
    }

    private ArrayList<LilySlot> buildLilySlots(int count) {
        ArrayList<LilySlot> slots = new ArrayList<>();
        int[][] positions = {
            {},
            {},
            {},
            {180, 480, 780},           // 3 slots
            {180, 380, 580, 780},      // 4 slots
            {80,  280, 480, 680, 880}, // 5 slots
        };
        int[] xs = (count >= 3 && count <= 5) ? positions[count] : positions[5];
        for (int x : xs) {
            slots.add(new LilySlot(x, 0, 40, LANE_HEIGHT));
        }
        return slots;
    }

    public void update(float dt) {
        if (gameOver || gameWon) return;

        for (Lane lane : lanes) lane.manageObstacle(dt);

        CollisionManager.CollisionResult result = collisionManager.update(frog, lanes, lilySlots, dt);

        switch (result) {
            case DEAD:
                score = scoreManager.getScore(); // sync avant game over
                if (lifes <= 1) {
                    lifes    = 0;
                    gameOver = true;
                } else {
                    respawnFrog(true);
                }
                return;

            case LILY_LANDED:
                onLilyLanded();
                return;

            default:
                break;
        }

        scoreManager.onFrogMoved(frog.getY());
        score = scoreManager.getScore();
        constrainFrog();
    }

    private void onLilyLanded() {
        for (LilySlot slot : lilySlots) {
            if (!slot.isOccupied()
                    && frog.getX() < slot.getX() + slot.getWidth()
                    && frog.getX() + frog.getWidth() > slot.getX()) {
                slot.setOccupied(true);
                Frog parked = new Frog(slot.getX(), slot.getY() + (LANE_HEIGHT - frog.getHeight()) / 2f, 40, 40);
                parked.setState(Frog.FrogState.WIN);
                parkedFrogs.add(parked);
                break;
            }
        }

        scoreManager.onFrogArrived();
        score = scoreManager.getScore();

        if (lilySlots.stream().allMatch(LilySlot::isOccupied)) {
            gameWon = true;
            return;
        }

        respawnFrog(false);
    }

    private void respawnFrog(boolean losesLife) {
        if (losesLife) lifes--;
        float startY = SCREEN_HEIGHT - 40f;
        frog = new Frog(SCREEN_WIDTH / 2f - 20, startY, 40, 40);
        scoreManager.onFrogRespawn();
        score = scoreManager.getScore();
    }

    private void constrainFrog() {
        if (frog.getX() < 0) frog.setX(0);
        if (frog.getX() > SCREEN_WIDTH - frog.getWidth()) frog.setX(SCREEN_WIDTH - frog.getWidth());
        if (frog.getY() > SCREEN_HEIGHT - frog.getHeight()) frog.setY(SCREEN_HEIGHT - frog.getHeight());
    }

    public void saveHighScores() {
        highScores = new ArrayList<>(HighScoreRepository.save(score));
    }

    public Frog                   getFrog()          { return frog; }
    public ArrayList<Lane>        getLanes()         { return lanes; }
    public ArrayList<LilySlot>    getLilySlots()     { return lilySlots; }
    public ArrayList<Frog>        getParkedFrogs()   { return parkedFrogs; }
    public int                    getScore()         { return score; }
    public boolean                isGameOver()       { return gameOver; }
    public boolean                isGameWon()        { return gameWon; }
    public int                    getSCREEN_WIDTH()  { return SCREEN_WIDTH; }
    public int                    getSCREEN_HEIGHT() { return SCREEN_HEIGHT; }
}
