package frogger.controller;

import org.java_websocket.server.WebSocketServer;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.WebSocket;

import com.google.gson.Gson;
import frogger.model.GameMap;

import java.net.InetSocketAddress;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class FroggerWebSocket extends WebSocketServer {

    private static final float SPEED_EASY = 0.7f;
    private static final float SPEED_NORMAL = 1.0f;
    private static final float SPEED_HARD = 1.4f;

    private enum NetState {
        IDLE, WAITING, PLAYING
    }

    private final Gson gson;
    private final int port;

    // Lobby simple: roomId -> état des joueurs prêts
    private static class LobbyState {
        private final Map<WebSocket, Boolean> readyBySocket = new ConcurrentHashMap<>();

        void addPlayer(WebSocket conn) {
            readyBySocket.put(conn, false);
        }

        void removePlayer(WebSocket conn) {
            readyBySocket.remove(conn);
        }

        void setReady(WebSocket conn, boolean ready) {
            readyBySocket.put(conn, ready);
        }

        int playerCount() {
            return readyBySocket.size();
        }

        int readyCount() {
            return (int) readyBySocket.values().stream().filter(Boolean::booleanValue).count();
        }

        boolean isComplete() {
            return playerCount() == 2 && readyCount() == 2;
        }

        boolean isEmpty() {
            return readyBySocket.isEmpty();
        }
    }

    private final Map<String, LobbyState> lobbyStates = new ConcurrentHashMap<>();

    // Per-room state container
    private static class RoomState {
        volatile NetState netState = NetState.IDLE;
        volatile WebSocket player1Socket = null;
        volatile WebSocket player2Socket = null;
        volatile boolean paused = false;
        volatile boolean scoreSaved = false;
        volatile GameMap gameMap = new GameMap();
    }

    // roomId -> RoomState
    private final Map<String, RoomState> roomStates = new ConcurrentHashMap<>();
    // Rooms: roomId -> set of WebSocket connections
    private final Map<String, Set<WebSocket>> rooms = new ConcurrentHashMap<>();
    // Connection -> roomId (each connection gets its own private room by default)
    private final Map<WebSocket, String> connRoom = new ConcurrentHashMap<>();

    public FroggerWebSocket(int port) {
        super(new InetSocketAddress("0.0.0.0", port));
        this.port = port;
        gson = new Gson();
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        System.out.println("Connexion : " + conn.getRemoteSocketAddress().getAddress().getHostAddress());

        String resource = handshake.getResourceDescriptor();
        String roomId = null;
        if (resource != null && resource.contains("?room=")) {
            int idx = resource.indexOf("?room=");
            roomId = resource.substring(idx + 6);
        }
        if (roomId == null || roomId.isEmpty()) {
            roomId = UUID.randomUUID().toString();
        }

        joinRoom(conn, roomId);
        conn.send("{\"type\":\"room\",\"roomId\":\"" + roomId + "\"}");

        registerLobbyPlayer(roomId, conn);

        RoomState rs = roomStates.computeIfAbsent(roomId, k -> new RoomState());

        if (rs.netState == NetState.WAITING && rs.player1Socket != null && rs.player1Socket.isOpen()) {
            rs.player2Socket = conn;
            rs.netState = NetState.PLAYING;
            rs.paused = false;
            rs.gameMap.setWaitingForPlayer2(false);
            if (rs.player1Socket != null)
                rs.player1Socket.send("{\"type\":\"init\",\"playerNumber\":1}");
            rs.player2Socket.send("{\"type\":\"init\",\"playerNumber\":2}");
            System.out.println("Joueur 2 connecté — partie réseau démarrée.");
        } else if (rs.netState == NetState.IDLE) {
            rs.gameMap = new GameMap();
            rs.scoreSaved = false;
            rs.paused = false;
        }
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        System.out.println("Déconnexion : " + conn.getRemoteSocketAddress().getAddress().getHostAddress());

        String rid = connRoom.get(conn);
        leaveRoom(conn);

        if (rid != null) {
            // Retirer du lobby
            unregisterLobbyPlayer(rid, conn);

            RoomState rs = roomStates.get(rid);
            if (rs != null && (conn == rs.player1Socket || conn == rs.player2Socket)) {
                WebSocket other = (conn == rs.player1Socket) ? rs.player2Socket : rs.player1Socket;
                if (other != null && other.isOpen()) {
                    other.send("{\"type\":\"opponentDisconnected\"}");
                }
                rs.netState = NetState.IDLE;
                rs.player1Socket = null;
                rs.player2Socket = null;
                rs.gameMap = new GameMap();
                rs.scoreSaved = false;
                rs.paused = false;
            }
        }
    }

    @Override
    public void onMessage(WebSocket conn, String message) {

        String rid = connRoom.get(conn);
        if (rid == null) {
            rid = UUID.randomUUID().toString();
            joinRoom(conn, rid);
        }
        RoomState rs = roomStates.computeIfAbsent(rid, k -> new RoomState());

        // ── Gestion simple du lobby ────────────────────────────────
        if ("READY".equals(message)) {
            updateLobbyReadyState(rid, conn, true);
            return;
        }
        if ("NOT_READY".equals(message)) {
            updateLobbyReadyState(rid, conn, false);
            return;
        }

        // ── Démarrage / reset ──────────────────────────────────────────────────
        if (message.startsWith("START:") || message.startsWith("RESET:")) {
            if (rs.netState == NetState.PLAYING
                    && conn != rs.player1Socket && conn != rs.player2Socket)
                return;

            String[] p = message.split(":");
            int slots = p.length > 1 ? parseSlots(p[1]) : 5;
            float speed = p.length > 2 ? parseSpeed(p[2]) : SPEED_NORMAL;
            String mode = p.length > 3 ? p[3] : "single";

            if ("network".equals(mode)) {
                if (rs.netState == NetState.PLAYING && rs.gameMap.isMultiplayerMode()) {
                    return;
                }
                rs.netState = NetState.WAITING;
                rs.player1Socket = conn;
                rs.player2Socket = null;
                rs.gameMap = new GameMap(slots, speed, true);
                rs.gameMap.setWaitingForPlayer2(true);
                rs.scoreSaved = false;
                rs.paused = false;
                lobbyStates.remove(rid);
                System.out.println("Mode réseau : en attente du joueur 2...");
            } else {
                rs.netState = NetState.IDLE;
                rs.player1Socket = null;
                rs.player2Socket = null;
                rs.gameMap = new GameMap(slots, speed, "multi".equals(mode));
                rs.scoreSaved = false;
                rs.paused = false;
            }
            return;
        }

        // ── Pause / reprise ───────────────────────────────────────
        if ("PAUSE".equals(message)) {
            rs.paused = true;
            return;
        }
        if ("RESUME".equals(message)) {
            rs.paused = false;
            return;
        }

        // ── Gardes ────────────────────────────────────────────────────────────
        if (rs.paused || rs.gameMap.isGameOver() || rs.gameMap.isGameWon())
            return;
        if (rs.gameMap.isWaitingForPlayer2())
            return;
        if (rs.netState != NetState.IDLE
                && conn != rs.player1Socket && conn != rs.player2Socket)
            return;

        // En réseau, le socket identifie le joueur ; en local le suffixe "2" le fait
        boolean isNetP2 = (rs.netState == NetState.PLAYING && conn == rs.player2Socket);

        switch (message) {
            case "UP":
                if (isNetP2)
                    rs.gameMap.tryJumpFrog2(0, -1);
                else
                    rs.gameMap.tryJumpFrog1(0, -1);
                break;
            case "DOWN":
                if (isNetP2)
                    rs.gameMap.tryJumpFrog2(0, 1);
                else
                    rs.gameMap.tryJumpFrog1(0, 1);
                break;
            case "LEFT":
                if (isNetP2)
                    rs.gameMap.tryJumpFrog2(-1, 0);
                else
                    rs.gameMap.tryJumpFrog1(-1, 0);
                break;
            case "RIGHT":
                if (isNetP2)
                    rs.gameMap.tryJumpFrog2(1, 0);
                else
                    rs.gameMap.tryJumpFrog1(1, 0);
                break;
            case "UP2":
                rs.gameMap.tryJumpFrog2(0, -1);
                break;
            case "DOWN2":
                rs.gameMap.tryJumpFrog2(0, 1);
                break;
            case "LEFT2":
                rs.gameMap.tryJumpFrog2(-1, 0);
                break;
            case "RIGHT2":
                rs.gameMap.tryJumpFrog2(1, 0);
                break;
        }
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        System.err.println("Erreur WebSocket : " + ex.getMessage());
    }

    @Override
    public void onStart() {
        System.out.println("Serveur démarré sur le port " + port + ".");
    }

    public void broadcastGameState() {
        // Iterate rooms and update/broadcast each room's GameMap separately
        for (Map.Entry<String, RoomState> e : roomStates.entrySet()) {
            String roomId = e.getKey();
            RoomState rs = e.getValue();
            GameMap current = rs.gameMap;
            // Pas de mise à jour si en pause ou en attente d'un joueur réseau
            if (!rs.paused && !current.isWaitingForPlayer2()) {
                current.update(16f / 1000f);
            }
            if ((current.isGameOver() || current.isGameWon()) && !rs.scoreSaved) {
                current.saveHighScores();
                rs.scoreSaved = true;
            }
            String payload = gson.toJson(current);
            sendToRoom(roomId, payload);
        }
    }

    // Room utilities
    private void joinRoom(WebSocket conn, String roomId) {
        rooms.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(conn);
        connRoom.put(conn, roomId);
    }

    private void leaveRoom(WebSocket conn) {
        String rid = connRoom.remove(conn);
        if (rid != null) {
            Set<WebSocket> set = rooms.get(rid);
            if (set != null) {
                set.remove(conn);
                if (set.isEmpty())
                    rooms.remove(rid);
            }
        }
    }

    public void sendToRoom(String roomId, String message) {
        Set<WebSocket> set = rooms.get(roomId);
        if (set != null) {
            for (WebSocket s : set) {
                if (s != null && s.isOpen())
                    s.send(message);
            }
        }
    }

    /**
     * Envoie l'état du lobby à tous les clients
     */
    private void broadcastLobbyState(String roomId) {
        LobbyState lobbyState = lobbyStates.get(roomId);
        if (lobbyState == null)
            return;

        int count = lobbyState.playerCount();
        int ready = lobbyState.readyCount();

        String msg = "{\"type\":\"lobby\",\"playerCount\":" + count + ",\"readyCount\":" + ready + "}";
        sendToRoom(roomId, msg);
    }

    /**
     * Signal que le jeu peut démarrer
     */
    private void broadcastLobbyReady(String roomId) {
        sendToRoom(roomId, "{\"type\":\"lobbyReady\"}");
    }

    private LobbyState getLobbyState(String roomId) {
        return lobbyStates.computeIfAbsent(roomId, k -> new LobbyState());
    }

    private void registerLobbyPlayer(String roomId, WebSocket conn) {
        getLobbyState(roomId).addPlayer(conn);
        broadcastLobbyState(roomId);
    }

    private void unregisterLobbyPlayer(String roomId, WebSocket conn) {
        LobbyState lobbyState = lobbyStates.get(roomId);
        if (lobbyState == null) {
            return;
        }

        lobbyState.removePlayer(conn);
        if (lobbyState.isEmpty()) {
            lobbyStates.remove(roomId);
        } else {
            broadcastLobbyState(roomId);
        }
    }

    private void updateLobbyReadyState(String roomId, WebSocket conn, boolean ready) {
        LobbyState lobbyState = getLobbyState(roomId);
        lobbyState.setReady(conn, ready);
        broadcastLobbyState(roomId);

        if (ready && lobbyState.isComplete()) {
            startNetworkMatch(roomId);
            broadcastLobbyReady(roomId);
        }
    }

    private void startNetworkMatch(String roomId) {
        RoomState rs = roomStates.computeIfAbsent(roomId, k -> new RoomState());
        if (rs.netState == NetState.PLAYING && rs.gameMap != null && rs.gameMap.isMultiplayerMode()) {
            return;
        }

        Set<WebSocket> sockets = rooms.get(roomId);
        if (sockets == null) {
            return;
        }

        WebSocket player1 = null;
        WebSocket player2 = null;
        for (WebSocket socket : sockets) {
            if (socket == null || !socket.isOpen()) {
                continue;
            }
            if (player1 == null) {
                player1 = socket;
            } else {
                player2 = socket;
                break;
            }
        }

        if (player1 == null || player2 == null) {
            return;
        }

        rs.netState = NetState.PLAYING;
        rs.player1Socket = player1;
        rs.player2Socket = player2;
        rs.paused = false;
        rs.scoreSaved = false;
        rs.gameMap = new GameMap(5, 1.0f, true);
        rs.gameMap.setWaitingForPlayer2(false);

        player1.send("{\"type\":\"init\",\"playerNumber\":1}");
        player2.send("{\"type\":\"init\",\"playerNumber\":2}");
        System.out.println("Partie réseau à 2 joueurs démarrée.");
    }

    private int parseSlots(String s) {
        try {
            int n = Integer.parseInt(s);
            return (n >= 3 && n <= 5) ? n : 5;
        } catch (NumberFormatException e) {
            return 5;
        }
    }

    private float parseSpeed(String s) {
        switch (s) {
            case "easy":
                return SPEED_EASY;
            case "hard":
                return SPEED_HARD;
            default:
                return SPEED_NORMAL;
        }
    }

    public GameMap getGameMap() {
        return null;
    }
}
