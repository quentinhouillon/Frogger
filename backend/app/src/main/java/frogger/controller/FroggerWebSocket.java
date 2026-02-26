package frogger.controller;

import org.java_websocket.server.WebSocketServer;

import com.google.gson.Gson;

import frogger.model.Frog;
import frogger.model.GameMap;

import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.WebSocket;
import java.net.InetSocketAddress;

public class FroggerWebSocket extends WebSocketServer {
    private GameMap gameMap;
    private Gson gson;
    
    public FroggerWebSocket(int port) {
        super(new InetSocketAddress(port));
        gameMap = new GameMap();
        gson = new Gson();
    }
    
    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        System.out.println("Nouveau joueur connecté !");
        System.out.println("IP du joueur: " + conn.getRemoteSocketAddress().getAddress().getHostAddress());
    }
    
    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        System.out.println("Un joueur s'est deconnecté !");
        System.out.println("IP du joueur: " + conn.getRemoteSocketAddress().getAddress().getHostAddress());
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        Frog frog = gameMap.getFrog();
        
        switch (message) {
            case "UP": frog.setDirection(0, -1); break;
            case "DOWN": frog.setDirection(0, 1); break;
            case "LEFT": frog.setDirection(-1, 0); break;
            case "RIGHT": frog.setDirection(1, 0); break;
            case "STOP": frog.setDirection(0, 0); break;
        }
        
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        System.err.println("Erreur: " + ex.getMessage());
        ex.printStackTrace();
    }

    @Override
    public void onStart() {
        System.err.println("Serveur démarré avec succès !");
    }

    public void broadcastGameState() {

        gameMap.update(16f / 1000f);

        String jsonState = gson.toJson(gameMap);

        broadcast(jsonState);
    }
    
    public GameMap getGameMap() {
        return gameMap;
    }
}
