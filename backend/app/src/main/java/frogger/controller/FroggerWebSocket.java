package frogger.controller;

import org.java_websocket.server.WebSocketServer;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.WebSocket;

import com.google.gson.Gson;

import frogger.model.Frog;
import frogger.model.GameMap;

import java.net.InetSocketAddress;

public class FroggerWebSocket extends WebSocketServer {

    private static final float SPEED_EASY   = 0.7f;
    private static final float SPEED_NORMAL = 1.0f;
    private static final float SPEED_HARD   = 1.4f;

    private volatile GameMap gameMap;
    private Gson             gson;
    private volatile boolean scoreSaved;

    public FroggerWebSocket(int port) {
        super(new InetSocketAddress(port));
        gameMap = new GameMap();
        gson    = new Gson();
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        System.out.println("Joueur connecté : " + conn.getRemoteSocketAddress().getAddress().getHostAddress());
        gameMap    = new GameMap();
        scoreSaved = false;
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        System.out.println("Joueur déconnecté : " + conn.getRemoteSocketAddress().getAddress().getHostAddress());
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        // START:{slotsCount}:{difficulty}  ex: "START:5:normal"
        if (message.startsWith("START:") || message.startsWith("RESET:")) {
            String[] parts = message.split(":");
            int   slots = parts.length > 1 ? parseSlots(parts[1])      : 5;
            float speed = parts.length > 2 ? parseSpeed(parts[2])      : SPEED_NORMAL;
            gameMap    = new GameMap(slots, speed);
            scoreSaved = false;
            return;
        }

        if (gameMap.isGameOver() || gameMap.isGameWon()) return;

        Frog frog = gameMap.getFrog();
        switch (message) {
            case "UP":    frog.jump( 0, -1); break;
            case "DOWN":  frog.jump( 0,  1); break;
            case "LEFT":  frog.jump(-1,  0); break;
            case "RIGHT": frog.jump( 1,  0); break;
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
        // Capture locale : évite qu'un onMessage() réassigne gameMap pendant ce tick
        GameMap current = gameMap;
        current.update(16f / 1000f);

        if ((current.isGameOver() || current.isGameWon()) && !scoreSaved) {
            current.saveHighScores();
            scoreSaved = true;
        }

        broadcast(gson.toJson(current));
    }

    private int parseSlots(String s) {
        try {
            int n = Integer.parseInt(s);
            return (n >= 3 && n <= 5) ? n : 5;
        } catch (NumberFormatException e) { return 5; }
    }

    private float parseSpeed(String s) {
        switch (s) {
            case "easy":  return SPEED_EASY;
            case "hard":  return SPEED_HARD;
            default:      return SPEED_NORMAL;
        }
    }

    public GameMap getGameMap() { return gameMap; }
}
