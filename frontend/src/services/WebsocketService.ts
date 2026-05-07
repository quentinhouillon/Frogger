type Listener    = (data: any) => void;
type VoidHandler = () => void;

const RECONNECT_DELAY_MS = 2000;

export function getWebSocketUrl() {
    const configuredUrl = import.meta.env.VITE_WS_URL as string | undefined;
    if (configuredUrl && configuredUrl.trim().length > 0) {
        return configuredUrl;
    }

    if (typeof window !== 'undefined') {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.hostname}:8080`;
    }

    return 'ws://localhost:8080';
}

class WebSocketService {
    private socket:           WebSocket | null = null;
    private listeners:        Set<Listener>    = new Set();
    private connectedHandlers: Set<VoidHandler> = new Set();
    private currentUrl:       string | null    = null;
    private reconnectTimer:   ReturnType<typeof setTimeout> | null = null;

    connect(url: string) {
        this.currentUrl = url;
        this._open(url);
    }

    private _open(url: string) {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            // Déjà ouvert : notifier immédiatement les handlers en attente
            if (this.socket.readyState === WebSocket.OPEN) {
                this.connectedHandlers.forEach(h => h());
            }
            return;
        }

        console.log(`Connexion à ${url}...`);
        const ws = new WebSocket(url);
        this.socket = ws;

        ws.onopen = () => {
            console.log('WebSocket connecté.');
            if (this.reconnectTimer !== null) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            this.connectedHandlers.forEach(h => h());
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.listeners.forEach(l => l(data));
            } catch (e) {
                console.error('Erreur de parsing JSON', e);
            }
        };

        ws.onclose = () => {
            console.log(`WebSocket déconnecté. Reconnexion dans ${RECONNECT_DELAY_MS}ms...`);
            if (this.socket === ws) this.socket = null;
            if (this.currentUrl) {
                this.reconnectTimer = setTimeout(() => this._open(this.currentUrl!), RECONNECT_DELAY_MS);
            }
        };

        ws.onerror = (e) => console.error('Erreur WebSocket :', e);
    }

    /** S'abonne aux messages JSON reçus du serveur. Retourne un unsubscribe. */
    subscribe(callback: Listener): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * Enregistre un callback à appeler dès que la connexion est (ou devient) ouverte.
     * Si déjà connecté, appelé immédiatement.
     */
    onConnected(handler: VoidHandler) {
        this.connectedHandlers.add(handler);
        if (this.socket?.readyState === WebSocket.OPEN) handler();
    }

    removeOnConnected(handler: VoidHandler) {
        this.connectedHandlers.delete(handler);
    }

    send(message: string) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.warn('Impossible d\'envoyer : WebSocket non connecté.');
        }
    }

    disconnect() {
        this.currentUrl = null;
        if (this.reconnectTimer !== null) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.socket?.close();
        this.socket = null;
    }
}

export const wsService = new WebSocketService();