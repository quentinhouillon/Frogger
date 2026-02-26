class WebSocketService {
    socket: WebSocket | null;
    listeners: any;

    constructor() {
        this.socket = null;
        this.listeners = new Set();
    }

    connect(url: string) {
        if (this.socket) return;

        this.socket = new WebSocket(url)

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.listeners.forEach((callback: any) => callback(data));
        }

        this.socket.onclose = () => {
            this.socket = null;
            console.log("Socket déconnecté avec succès !")
        }
    }

    send(message: JSON) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket?.send(JSON.stringify(message));
        }
    }

    disconnect() {
        this.socket?.close();
    }
}

export const wsService = new WebSocketService();