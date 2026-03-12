
type Listener = (data: any) => void;

class WebSocketService {
    private socket: WebSocket | null = null;
    private listeners: Set<Listener> = new Set();

    constructor() {
        
    }

    connect(url: string) {
        // Si déjà connecté ou en cours de connexion, on ne fait rien
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        console.log(`Tentative de connexion à ${url}...`);
        const ws = new WebSocket(url) 
        this.socket = ws;

        ws.onopen = () => {
            console.log("WebSocket connecté !");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // On prévient tous les abonnés (les composants React)
                this.listeners.forEach((listener) => listener(data));
            } catch (error) {
                console.error("Erreur de parsing JSON", error);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket déconnecté.");
            if (this.socket === ws) {
            this.socket = null;

            }
        };

        this.socket.onerror = (error) => {
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
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

// On exporte une INSTANCE unique (Singleton)
export const wsService = new WebSocketService();