package frogger;

import frogger.controller.FroggerWebSocket;

public class App {
    public static void main(String[] args) {
        FroggerWebSocket froggerWebSocket = new FroggerWebSocket(8080);
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
