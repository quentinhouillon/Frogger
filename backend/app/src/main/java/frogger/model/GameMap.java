package frogger.model;

import java.util.ArrayList;

public class GameMap {
    public static final int  SCREEN_WIDTH  = 1000;
    public static final int  SCREEN_HEIGHT = 650;
    private static final int LANE_HEIGHT   = 50;
    private static final int MAX_LIFES     = 3;

    // Conservé pour passer aux ScoreManagers
    private final float speedMult;

    private final int screenWidth  = SCREEN_WIDTH;
    private final int screenHeight = SCREEN_HEIGHT;

    // ── Commun ────────────────────────────────────────────────────────────────
    private final ArrayList<Lane>     lanes;
    private final CollisionManager    collisionManager;
    private final int                 maxLifes;
    private boolean                   gameOver;
    private boolean                   gameWon;
    private boolean                   waitingForPlayer2;
    private ArrayList<HighScoreEntry> highScores;
    private final boolean             multiplayerMode;

    // ── Joueur 1 ──────────────────────────────────────────────────────────────
    private Frog                       frog;
    private final ScoreManager         scoreManager;
    private int                        score;
    private int                        combo;
    private float                      timeLeft;
    private ScoreManager.ScoreBreakdown scoreBreakdown;  // exposé en JSON
    private int                        lifes;
    private final ArrayList<LilySlot>  lilySlots;
    private final ArrayList<Frog>      parkedFrogs;

    // Délai (en ticks) avant respawn après mort — laisse le frontend jouer l'animation
    private int respawnDelay1 = 0;
    private int respawnDelay2 = 0;
    private static final int DEATH_ANIM_TICKS = 40; // 40 × 16ms = 640ms

    // ── Joueur 2 (multijoueur uniquement, null en solo) ───────────────────────
    private Frog                       frog2;
    private ScoreManager               scoreManager2;
    private int                        score2;
    private int                        combo2;
    private float                      timeLeft2;
    private ScoreManager.ScoreBreakdown scoreBreakdown2; // exposé en JSON
    private int                        lifes2;
    private ArrayList<LilySlot>        lilySlots2;
    private ArrayList<Frog>            parkedFrogs2;
    private int                        winner;

    // ── Constructeur principal ────────────────────────────────────────────────
    public GameMap(int slotsCount, float speedMult, boolean multiplayer) {
        this.multiplayerMode = multiplayer;
        this.speedMult       = speedMult;
        lanes            = LaneConfig.buildLanes(SCREEN_WIDTH, speedMult);
        collisionManager = new CollisionManager();
        maxLifes         = MAX_LIFES;
        gameOver         = false;
        gameWon          = false;
        winner           = 0;
        highScores       = new ArrayList<>(HighScoreRepository.load());

        float startY = SCREEN_HEIGHT - 40f;

        // J1 démarre légèrement à gauche du centre
        float p1StartX = 430f;
        frog         = new Frog(p1StartX, startY, 40, 40);
        scoreManager = new ScoreManager(startY, speedMult);
        score        = 0;
        combo        = 0;
        timeLeft     = 30f;
        scoreBreakdown = scoreManager.getBreakdown();
        lifes        = MAX_LIFES;
        lilySlots    = multiplayer ? buildMultiSlots(1) : buildSoloSlots(slotsCount);
        parkedFrogs  = new ArrayList<>();

        // J2 démarre légèrement à droite du centre (multijoueur seulement)
        if (multiplayer) {
            float p2StartX = 530f;
            frog2         = new Frog(p2StartX, startY, 40, 40);
            scoreManager2 = new ScoreManager(startY, speedMult);
            score2        = 0;
            combo2        = 0;
            timeLeft2     = 30f;
            scoreBreakdown2 = scoreManager2.getBreakdown();
            lifes2        = MAX_LIFES;
            lilySlots2    = buildMultiSlots(2);
            parkedFrogs2  = new ArrayList<>();
        }
    }

    public GameMap(int slotsCount, float speedMult) { this(slotsCount, speedMult, false); }
    public GameMap()                                 { this(5, 1.0f, false); }

    // ── Slots solo ────────────────────────────────────────────────────────────
    private ArrayList<LilySlot> buildSoloSlots(int count) {
        ArrayList<LilySlot> slots = new ArrayList<>();
        int[][] positions = {
            {}, {}, {},
            {180, 480, 780},
            {180, 380, 580, 780},
            {80,  280, 480, 680, 880},
        };
        int[] xs = (count >= 3 && count <= 5) ? positions[count] : positions[5];
        for (int x : xs) slots.add(new LilySlot(x, 0, 40, LANE_HEIGHT));
        return slots;
    }

    // ── Slots multijoueur (3 par joueur, côtés opposés) ───────────────────────
    private ArrayList<LilySlot> buildMultiSlots(int player) {
        ArrayList<LilySlot> slots = new ArrayList<>();
        // J1 : gauche  (80, 230, 380) — tous atteignables depuis x=430
        // J2 : droite  (580, 730, 880) — tous atteignables depuis x=530
        int[] xs = player == 1 ? new int[]{80, 230, 380} : new int[]{580, 730, 880};
        for (int x : xs) slots.add(new LilySlot(x, 0, 40, LANE_HEIGHT));
        return slots;
    }

    // ── Boucle principale ─────────────────────────────────────────────────────
    public void update(float dt) {
        if (gameOver || gameWon) return;

        for (Lane lane : lanes) lane.manageObstacle(dt);

        // ── Timer J1 (s'il est vivant) ──
        if (frog.getState() == Frog.FrogState.LIVING) {
            scoreManager.update(dt);
            timeLeft = scoreManager.getTimeLeft();
        }

        // ── Grenouille 1 ──
        if (respawnDelay1 > 0) {
            if (--respawnDelay1 == 0) spawnFrog1();
        } else {
            CollisionManager.CollisionResult r1 = collisionManager.update(frog, lanes, lilySlots, dt);
            switch (r1) {
                case DEAD:
                    scoreManager.onFrogDied();
                    score = scoreManager.getScore();
                    combo = scoreManager.getCombo();
                    if (lifes <= 1) {
                        lifes = 0;
                        if (multiplayerMode) { winner = 2; scoreManager2.onGameWon(lifes2); score2 = scoreManager2.getScore(); gameWon = true; }
                        else                  gameOver = true;
                        return;
                    }
                    lifes--;
                    respawnDelay1 = DEATH_ANIM_TICKS;
                    break;

                case LILY_LANDED:
                    landOnSlot(frog, lilySlots, parkedFrogs, scoreManager, 1);
                    if (gameOver || gameWon) return;
                    break;

                default:
                    if (frog.getState() == Frog.FrogState.LIVING) {
                        scoreManager.onFrogMoved(frog.getY());
                        score          = scoreManager.getScore();
                        combo          = scoreManager.getCombo();
                        scoreBreakdown = scoreManager.getBreakdown();
                    }
                    constrainFrog(frog);
            }
        }

        // ── Grenouille 2 (multijoueur) ──
        if (!multiplayerMode || frog2 == null) return;

        // Timer J2
        if (frog2.getState() == Frog.FrogState.LIVING) {
            scoreManager2.update(dt);
            timeLeft2 = scoreManager2.getTimeLeft();
        }

        if (respawnDelay2 > 0) {
            if (--respawnDelay2 == 0) spawnFrog2();
        } else {
            CollisionManager.CollisionResult r2 = collisionManager.update(frog2, lanes, lilySlots2, dt);
            switch (r2) {
                case DEAD:
                    scoreManager2.onFrogDied();
                    score2 = scoreManager2.getScore();
                    combo2 = scoreManager2.getCombo();
                    if (lifes2 <= 1) {
                        lifes2 = 0;
                        winner = 1;
                        scoreManager.onGameWon(lifes);
                        score = scoreManager.getScore();
                        gameWon = true;
                        return;
                    }
                    lifes2--;
                    respawnDelay2 = DEATH_ANIM_TICKS;
                    break;

                case LILY_LANDED:
                    landOnSlot(frog2, lilySlots2, parkedFrogs2, scoreManager2, 2);
                    break;

                default:
                    if (frog2.getState() == Frog.FrogState.LIVING) {
                        scoreManager2.onFrogMoved(frog2.getY());
                        score2          = scoreManager2.getScore();
                        combo2          = scoreManager2.getCombo();
                        scoreBreakdown2 = scoreManager2.getBreakdown();
                    }
                    constrainFrog(frog2);
            }
        }
    }

    // ── Atterrissage sur nénuphar ─────────────────────────────────────────────
    private void landOnSlot(Frog f, ArrayList<LilySlot> slots,
                             ArrayList<Frog> parked, ScoreManager sm, int playerNum) {
        for (LilySlot slot : slots) {
            if (!slot.isOccupied()
                    && f.getX() < slot.getX() + slot.getWidth()
                    && f.getX() + f.getWidth() > slot.getX()) {
                slot.setOccupied(true);
                Frog p = new Frog(slot.getX(), slot.getY() + (LANE_HEIGHT - f.getHeight()) / 2f, 40, 40);
                p.setState(Frog.FrogState.WIN);
                parked.add(p);
                break;
            }
        }
        sm.onFrogArrived();
        if (playerNum == 1) { score  = sm.getScore(); combo  = sm.getCombo(); scoreBreakdown  = sm.getBreakdown(); }
        else                 { score2 = sm.getScore(); combo2 = sm.getCombo(); scoreBreakdown2 = sm.getBreakdown(); }

        if (slots.stream().allMatch(LilySlot::isOccupied)) {
            // Bonus de vies restantes au vainqueur
            int livesLeft = (playerNum == 1) ? lifes : lifes2;
            sm.onGameWon(livesLeft);
            if (playerNum == 1) { score  = sm.getScore(); scoreBreakdown  = sm.getBreakdown(); }
            else                 { score2 = sm.getScore(); scoreBreakdown2 = sm.getBreakdown(); }
            winner  = playerNum;
            gameWon = true;
            return;
        }

        if (playerNum == 1) respawnFrog1(false);
        else                 respawnFrog2(false);
    }

    // ── Respawns ──────────────────────────────────────────────────────────────

    // Crée physiquement une nouvelle grenouille et synchronise les champs de score.
    // Appelé soit immédiatement (atterrissage nénuphar) soit après le délai d'animation.
    private void spawnFrog1() {
        frog           = new Frog(430f, SCREEN_HEIGHT - 40f, 40, 40);
        score          = scoreManager.getScore();
        timeLeft       = scoreManager.getTimeLeft();
        scoreBreakdown = scoreManager.getBreakdown();
    }

    private void spawnFrog2() {
        frog2           = new Frog(530f, SCREEN_HEIGHT - 40f, 40, 40);
        score2          = scoreManager2.getScore();
        timeLeft2       = scoreManager2.getTimeLeft();
        scoreBreakdown2 = scoreManager2.getBreakdown();
    }

    // Utilisé uniquement lors d'un atterrissage sur nénuphar (pas de perte de vie).
    private void respawnFrog1(boolean losesLife) {
        if (losesLife) lifes--;
        if (!losesLife) scoreManager.onFrogRespawn();
        spawnFrog1();
    }

    private void respawnFrog2(boolean losesLife) {
        if (losesLife) lifes2--;
        if (!losesLife) scoreManager2.onFrogRespawn();
        spawnFrog2();
    }

    // ── Contrainte écran ──────────────────────────────────────────────────────
    private void constrainFrog(Frog f) {
        if (f.getX() < 0)                          f.setX(0);
        if (f.getX() > SCREEN_WIDTH - f.getWidth()) f.setX(SCREEN_WIDTH - f.getWidth());
        if (f.getY() > SCREEN_HEIGHT - f.getHeight()) f.setY(SCREEN_HEIGHT - f.getHeight());
    }

    // ── Saut avec blocage inter-joueurs ───────────────────────────────────────
    /**
     * Tente de faire sauter `mover`. Si la destination est occupée par `blocker`,
     * le saut est annulé silencieusement (bloqueur gagne).
     */
    private void tryJump(Frog mover, Frog blocker, int dx, int dy) {
        if (mover == null || mover.getState() != Frog.FrogState.LIVING) return;
        if (blocker != null && blocker.getState() == Frog.FrogState.LIVING) {
            float destX = mover.getX() + dx * Frog.JUMP_SIZE;
            float destY = mover.getY() + dy * Frog.JUMP_SIZE;
            boolean blocked = destX < blocker.getX() + blocker.getWidth()
                           && destX + mover.getWidth()  > blocker.getX()
                           && destY < blocker.getY() + blocker.getHeight()
                           && destY + mover.getHeight() > blocker.getY();
            if (blocked) return;
        }
        mover.jump(dx, dy);
    }

    public void tryJumpFrog1(int dx, int dy) { tryJump(frog,  frog2, dx, dy); }
    public void tryJumpFrog2(int dx, int dy) { tryJump(frog2, frog,  dx, dy); }

    // ── Scores ────────────────────────────────────────────────────────────────
    public void saveHighScores() {
        int best = multiplayerMode ? Math.max(score, score2) : score;
        highScores = new ArrayList<>(HighScoreRepository.save(best));
    }

    // ── Getters ───────────────────────────────────────────────────────────────
    public void    setWaitingForPlayer2(boolean v)  { waitingForPlayer2 = v; }
    public boolean isWaitingForPlayer2()            { return waitingForPlayer2; }

    public Frog                   getFrog()            { return frog;            }
    public Frog                   getFrog2()           { return frog2;           }
    public ArrayList<Lane>        getLanes()           { return lanes;           }
    public ArrayList<LilySlot>    getLilySlots()       { return lilySlots;       }
    public ArrayList<LilySlot>    getLilySlots2()      { return lilySlots2;      }
    public ArrayList<Frog>        getParkedFrogs()     { return parkedFrogs;     }
    public ArrayList<Frog>        getParkedFrogs2()    { return parkedFrogs2;    }
    public int                    getScore()           { return score;           }
    public int                    getScore2()          { return score2;          }
    public int                    getCombo()           { return combo;           }
    public int                    getCombo2()          { return combo2;          }
    public float                       getTimeLeft()          { return timeLeft;         }
    public float                       getTimeLeft2()         { return timeLeft2;        }
    public ScoreManager.ScoreBreakdown getScoreBreakdown()    { return scoreBreakdown;   }
    public ScoreManager.ScoreBreakdown getScoreBreakdown2()   { return scoreBreakdown2;  }
    public boolean                     isGameOver()           { return gameOver;         }
    public boolean                     isGameWon()            { return gameWon;          }
    public boolean                     isMultiplayerMode()    { return multiplayerMode;  }
    public int                         getSCREEN_WIDTH()      { return SCREEN_WIDTH;     }
    public int                         getSCREEN_HEIGHT()     { return SCREEN_HEIGHT;    }
}
