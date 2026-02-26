package frogger.controller;

import org.java_websocket.server.WebSocketServer;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.WebSocket;
import java.net.InetSocketAddress;

public class FroggerWebSocket extends WebSocketServer {
    public FroggerWebSocket(int port) {
        super(new InetSocketAddress(port));
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
        // Réception d'un mouvement
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
}
