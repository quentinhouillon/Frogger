package frogger.controller;

import org.java_websocket.server.WebSocketServer;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.WebSocket;

import com.google.gson.Gson;
import frogger.model.GameMap;

import java.net.InetSocketAddress;

public class FroggerWebSocket extends WebSocketServer {

    private static final float SPEED_EASY   = 0.7f;
    private static final float SPEED_NORMAL = 1.0f;
    private static final float SPEED_HARD   = 1.4f;

    private enum NetState { IDLE, WAITING, PLAYING }

    private volatile GameMap   gameMap;
    private final    Gson      gson;
    private volatile boolean   scoreSaved;
    private volatile NetState  netState      = NetState.IDLE;
    private volatile WebSocket player1Socket = null;
    private volatile WebSocket player2Socket = null;
    private volatile boolean   paused        = false;

    public FroggerWebSocket(int port) {
        super(new InetSocketAddress(port));
        gameMap = new GameMap();
        gson    = new Gson();
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        System.out.println("Connexion : " + conn.getRemoteSocketAddress().getAddress().getHostAddress());

        if (netState == NetState.WAITING
                && player1Socket != null && player1Socket.isOpen()) {
            // Joueur 2 rejoint la session réseau
            player2Socket = conn;
            netState      = NetState.PLAYING;
            paused        = false;
            gameMap.setWaitingForPlayer2(false);
            player1Socket.send("{\"type\":\"init\",\"playerNumber\":1}");
            player2Socket.send("{\"type\":\"init\",\"playerNumber\":2}");
            System.out.println("Joueur 2 connecté — partie réseau démarrée.");

        } else if (netState == NetState.IDLE) {
            gameMap    = new GameMap();
            scoreSaved = false;
            paused     = false;
        }
        // netState == PLAYING : connexion supplémentaire ignorée
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        System.out.println("Déconnexion : " + conn.getRemoteSocketAddress().getAddress().getHostAddress());

        if (netState != NetState.IDLE
                && (conn == player1Socket || conn == player2Socket)) {
            WebSocket other = (conn == player1Socket) ? player2Socket : player1Socket;
            if (other != null && other.isOpen()) {
                other.send("{\"type\":\"opponentDisconnected\"}");
            }
            netState      = NetState.IDLE;
            player1Socket = null;
            player2Socket = null;
            gameMap       = new GameMap();
            scoreSaved    = false;
            paused        = false;
            System.out.println("Session réseau réinitialisée.");
        }
    }

    @Override
    public void onMessage(WebSocket conn, String message) {

        // ── Démarrage / reset ──────────────────────────────────────────────────
        if (message.startsWith("START:") || message.startsWith("RESET:")) {
            if (netState == NetState.PLAYING
                    && conn != player1Socket && conn != player2Socket) return;

            String[] p  = message.split(":");
            int   slots = p.length > 1 ? parseSlots(p[1]) : 5;
            float speed = p.length > 2 ? parseSpeed(p[2]) : SPEED_NORMAL;
            String mode = p.length > 3 ? p[3] : "single";

            if ("network".equals(mode)) {
                netState      = NetState.WAITING;
                player1Socket = conn;
                player2Socket = null;
                gameMap       = new GameMap(slots, speed, true);
                gameMap.setWaitingForPlayer2(true);
                scoreSaved    = false;
                paused        = false;
                System.out.println("Mode réseau : en attente du joueur 2...");
            } else {
                netState      = NetState.IDLE;
                player1Socket = null;
                player2Socket = null;
                gameMap       = new GameMap(slots, speed, "multi".equals(mode));
                scoreSaved    = false;
                paused        = false;
            }
            return;
        }

        // ── Pause / reprise (fonctionnalité de leur branche) ───────────────────
        if ("PAUSE".equals(message))  { paused = true;  return; }
        if ("RESUME".equals(message)) { paused = false; return; }

        // ── Gardes ────────────────────────────────────────────────────────────
        if (paused || gameMap.isGameOver() || gameMap.isGameWon()) return;
        if (gameMap.isWaitingForPlayer2()) return;
        if (netState != NetState.IDLE
                && conn != player1Socket && conn != player2Socket) return;

        // En réseau, le socket identifie le joueur ; en local le suffixe "2" le fait
        boolean isNetP2 = (netState == NetState.PLAYING && conn == player2Socket);

        switch (message) {
            case "UP":     if (isNetP2) gameMap.tryJumpFrog2( 0,-1); else gameMap.tryJumpFrog1( 0,-1); break;
            case "DOWN":   if (isNetP2) gameMap.tryJumpFrog2( 0, 1); else gameMap.tryJumpFrog1( 0, 1); break;
            case "LEFT":   if (isNetP2) gameMap.tryJumpFrog2(-1, 0); else gameMap.tryJumpFrog1(-1, 0); break;
            case "RIGHT":  if (isNetP2) gameMap.tryJumpFrog2( 1, 0); else gameMap.tryJumpFrog1( 1, 0); break;
            case "UP2":    gameMap.tryJumpFrog2( 0,-1); break;
            case "DOWN2":  gameMap.tryJumpFrog2( 0, 1); break;
            case "LEFT2":  gameMap.tryJumpFrog2(-1, 0); break;
            case "RIGHT2": gameMap.tryJumpFrog2( 1, 0); break;
        }
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        System.err.println("Erreur WebSocket : " + ex.getMessage());
    }

    @Override
    public void onStart() {
        System.out.println("Serveur démarré sur le port 8080.");
    }

    public void broadcastGameState() {
        GameMap current = gameMap;
        // Pas de mise à jour si en pause ou en attente d'un joueur réseau
        if (!paused && !current.isWaitingForPlayer2()) {
            current.update(16f / 1000f);
        }
        if ((current.isGameOver() || current.isGameWon()) && !scoreSaved) {
            current.saveHighScores();
            scoreSaved = true;
        }
        broadcast(gson.toJson(current));
    }

    private int parseSlots(String s) {
        try { int n = Integer.parseInt(s); return (n >= 3 && n <= 5) ? n : 5; }
        catch (NumberFormatException e) { return 5; }
    }

    private float parseSpeed(String s) {
        switch (s) {
            case "easy": return SPEED_EASY;
            case "hard": return SPEED_HARD;
            default:     return SPEED_NORMAL;
        }
    }

    public GameMap getGameMap() { return gameMap; }
}
