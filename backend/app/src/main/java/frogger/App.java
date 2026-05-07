package frogger;

import frogger.controller.FroggerWebSocket;

public class App {
    public static void main(String[] args) {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        FroggerWebSocket froggerWebSocket = new FroggerWebSocket(port);
        froggerWebSocket.start();

        while (true) {
            froggerWebSocket.broadcastGameState();
            try {
                Thread.sleep(16);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
