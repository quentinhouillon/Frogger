
type Listener = (data: any) => void;

const RECONNECT_DELAY_MS = 2000;

class WebSocketService {
    private socket: WebSocket | null = null;
    private listeners: Set<Listener> = new Set();
    private currentUrl: string | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    connect(url: string) {
        this.currentUrl = url;
        this._open(url);
    }

    private _open(url: string) {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        console.log(`Tentative de connexion à ${url}...`);
        const ws = new WebSocket(url);
        this.socket = ws;

        ws.onopen = () => {
            console.log("WebSocket connecté !");
            if (this.reconnectTimer !== null) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.listeners.forEach((listener) => listener(data));
            } catch (error) {
                console.error("Erreur de parsing JSON", error);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket déconnecté. Reconnexion dans " + RECONNECT_DELAY_MS + "ms...");
            if (this.socket === ws) {
                this.socket = null;
            }
            if (this.currentUrl) {
                this.reconnectTimer = setTimeout(() => this._open(this.currentUrl!), RECONNECT_DELAY_MS);
            }
        };

        ws.onerror = (error) => {
            console.error("Erreur WebSocket :", error);
        };
    }

    /**
     * Permet à un composant de s'abonner aux messages.
     * @param callback La fonction à exécuter quand un message arrive.
     * @returns Une fonction de nettoyage pour se désabonner.
     */
    subscribe(callback: Listener): () => void {
        this.listeners.add(callback);

        // On retourne une fonction "unsubscribe"
        // C'est très pratique pour le useEffect de React !
        return () => {
            this.listeners.delete(callback);    
            console.log("Composant désabonné.");
        };
    }

    send(message: string) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.warn("Impossible d'envoyer : WebSocket non connecté.");
        }
    }

    disconnect() {
        this.currentUrl = null;
        if (this.reconnectTimer !== null) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

// On exporte une INSTANCE unique (Singleton)
export const wsService = new WebSocketService();