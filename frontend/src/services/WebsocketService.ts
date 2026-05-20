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
        return `${protocol}//${window.location.hostname}:1234`;
    }

    return 'ws://localhost:1234';
}

class WebSocketService {
    private socket:           WebSocket | null = null;
    private listeners:        Set<Listener>    = new Set();
    private connectedHandlers: Set<VoidHandler> = new Set();
    private currentUrl:       string | null    = null;
    private reconnectTimer:   ReturnType<typeof setTimeout> | null = null;
    private roomId: string | null = null;

    constructor() {
        // roomId is kept only in memory for this session
    }

    connect(url: string) {
        this.currentUrl = url;
        this._open(this.buildUrlWithRoom(url));
    }

    private buildUrlWithRoom(url: string) {
        if (!this.roomId) return url;
        const sep = url.includes('?') ? '&' : '?';
        return `${url}${sep}room=${encodeURIComponent(this.roomId)}`;
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
                // Room assignment message from server
                if (data && data.type === 'room' && typeof data.roomId === 'string') {
                    this.roomId = data.roomId;
                }
                this.listeners.forEach(l => l(data));
            } catch (e) {
                console.error('Erreur de parsing JSON', e);
            }
        };

        ws.onclose = () => {
            console.log(`WebSocket déconnecté. Reconnexion dans ${RECONNECT_DELAY_MS}ms...`);
            if (this.socket === ws) this.socket = null;
            if (this.currentUrl) {
                // Use room-aware URL on reconnect
                this.reconnectTimer = setTimeout(() => this._open(this.buildUrlWithRoom(this.currentUrl!)), RECONNECT_DELAY_MS);
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

    /**
     * Change vers une nouvelle room et reconneecte
     */
    setRoom(newRoomId: string) {
        this.roomId = newRoomId;
        
        // Fermer l'ancienne connexion pour forcer une nouvelle
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        
        // Reconnecter avec la nouvelle room
        if (this.currentUrl) {
            this._open(this.buildUrlWithRoom(this.currentUrl));
        }
    }
}

export const wsService = new WebSocketService();
// Expose a typed getter for the current room id
export function getCurrentRoomId(): string | null {
    return wsService['roomId'] ?? null;
}