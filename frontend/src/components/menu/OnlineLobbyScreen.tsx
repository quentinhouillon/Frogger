import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { wsService } from '../../services/WebsocketService';
import LoadingScreen from '../screens/LoadingScreen';

interface Props {
    onStartGame: () => void;
    onBack: () => void;
}

type LobbyAction = 'create' | 'join';
type LobbyView = 'select' | 'joinForm' | 'lobby';

const LOADING_MESSAGES: Record<LobbyAction, string> = {
    create: 'Création de la room…',
    join: 'Connexion à la room…',
};

const OnlineLobbyScreen = ({ onStartGame, onBack }: Props) => {
    const [view, setView] = useState<LobbyView>('select');
    const [roomId, setRoomId] = useState('');
    const [roomAction, setRoomAction] = useState<LobbyAction | null>(null);
    const [playerCount, setPlayerCount] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [copied, setCopied] = useState(false);
    const [inputRoomId, setInputRoomId] = useState('');
    const pendingActionRef = useRef<LobbyAction | null>(null);

    const resetLobbyState = () => {
        setRoomId('');
        setPlayerCount(0);
        setIsReady(false);
        setCopied(false);
        pendingActionRef.current = null;
        setRoomAction(null);
    };

    const backToSelect = () => {
        resetLobbyState();
        setInputRoomId('');
        setView('select');
    };

    const connectToRoom = (action: LobbyAction, roomCode: string) => {
        pendingActionRef.current = action;
        setRoomAction(action);
        setRoomId('');
        setPlayerCount(0);
        setIsReady(false);
        setCopied(false);
        wsService.setRoom(roomCode);
    };

    useEffect(() => {
        const unsubscribe = wsService.subscribe((data: any) => {
            if (pendingActionRef.current && data?.type === 'room' && typeof data.roomId === 'string') {
                setRoomId(data.roomId);
                setView('lobby');
                pendingActionRef.current = null;
                setRoomAction(null);
            }

            if (data?.type === 'lobby') {
                setPlayerCount(data.playerCount || 0);
            }

            if (data?.type === 'lobbyReady') {
                setTimeout(() => onStartGame(), 300);
            }
        });

        return () => unsubscribe();
    }, [onStartGame]);

    const handleCreate = () => {
        const newRoomId = Math.random().toString(36).substring(2, 10).toUpperCase();
        connectToRoom('create', newRoomId);
    };

    const handleJoin = () => {
        const roomCode = inputRoomId.trim().toUpperCase();
        if (!roomCode) {
            return;
        }
        connectToRoom('join', roomCode);
    };

    const toggleReady = () => {
        const nextReady = !isReady;
        setIsReady(nextReady);
        wsService.send(nextReady ? 'READY' : 'NOT_READY');
    };

    const handleCopyCode = async () => {
        if (!roomId) {
            return;
        }
        await navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    if (roomAction) {
        return <LoadingScreen message={LOADING_MESSAGES[roomAction]} />;
    }

    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center gap-6 select-none px-4"
             style={{ background: 'radial-gradient(circle at top, rgba(128,207,255,0.12) 0%, rgba(1,8,15,0.86) 40%, rgba(0,0,0,0.92) 100%)' }}>

            {view === 'select' && (
                <motion.div
                    className="relative w-full max-w-md overflow-hidden rounded-2xl border p-8 text-white text-center"
                    style={{ borderColor: 'rgba(128,207,255,0.35)', background: 'linear-gradient(165deg, rgba(5,11,18,0.97) 0%, rgba(6,7,10,0.97) 100%)' }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <p className="m-0 text-xs uppercase tracking-[0.25em] text-[#b4dae7]">🌐 Jouer en ligne</p>
                    <h1 className="m-0 mt-3 text-2xl font-semibold tracking-wide text-[#dff6ff]">Créer ou rejoindre</h1>

                    <div className="mt-8 flex flex-col gap-3">
                        <motion.button
                            onClick={handleCreate}
                            className="rounded-lg border-2 px-6 py-3 font-semibold uppercase tracking-widest text-sm"
                            style={{ borderColor: 'rgba(80,255,140,0.65)', background: 'linear-gradient(180deg, rgba(80,255,140,0.24), rgba(25,85,48,0.36))', color: '#e8ffef' }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            ➕ Créer une room
                        </motion.button>

                        <motion.button
                            onClick={() => {
                                resetLobbyState();
                                setInputRoomId('');
                                setView('joinForm');
                            }}
                            className="rounded-lg border-2 px-6 py-3 font-semibold uppercase tracking-widest text-sm"
                            style={{ borderColor: 'rgba(128,207,255,0.44)', background: 'linear-gradient(180deg, rgba(128,207,255,0.16), rgba(35,73,96,0.35))', color: '#daf2ff' }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            🔗 Rejoindre
                        </motion.button>

                        <motion.button
                            onClick={onBack}
                            className="rounded-lg border-2 px-6 py-3 font-semibold uppercase tracking-widest text-sm"
                            style={{ borderColor: 'rgba(255,255,255,0.18)', background: 'transparent', color: '#e8f6ff' }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            ← Retour
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {view === 'joinForm' && (
                <motion.div
                    className="relative w-full max-w-md overflow-hidden rounded-2xl border p-8 text-white"
                    style={{ borderColor: 'rgba(128,207,255,0.35)', background: 'linear-gradient(165deg, rgba(5,11,18,0.97) 0%, rgba(6,7,10,0.97) 100%)' }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <p className="m-0 text-xs uppercase tracking-[0.25em] text-[#b4dae7]">🔗 Rejoindre</p>
                    <h1 className="m-0 mt-3 text-lg font-semibold tracking-wide text-[#dff6ff]">Entrez le code</h1>

                    <div className="mt-6 flex flex-col gap-3">
                        <input
                            value={inputRoomId}
                            onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            placeholder="ABC12345"
                            autoFocus
                            className="rounded-lg border px-4 py-2 text-center font-mono text-lg text-white outline-none uppercase"
                            style={{ borderColor: 'rgba(128,207,255,0.35)', background: 'rgba(0,0,0,0.3)' }}
                        />

                        <motion.button
                            onClick={handleJoin}
                            disabled={!inputRoomId.trim()}
                            className="rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition disabled:opacity-50"
                            style={{ borderColor: 'rgba(128,207,255,0.44)', background: 'linear-gradient(180deg, rgba(128,207,255,0.16), rgba(35,73,96,0.35))', color: '#daf2ff' }}
                            whileHover={{ scale: 1.02 }}
                        >
                            Rejoindre la room
                        </motion.button>

                        <motion.button
                            onClick={backToSelect}
                            className="rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide"
                            style={{ borderColor: 'rgba(255,255,255,0.18)', background: 'transparent', color: '#e8f6ff' }}
                            whileHover={{ scale: 1.02 }}
                        >
                            ← Retour
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {view === 'lobby' && (
                <motion.div
                    className="relative w-full max-w-md overflow-hidden rounded-2xl border p-8 text-white"
                    style={{ borderColor: 'rgba(128,207,255,0.35)', background: 'linear-gradient(165deg, rgba(5,11,18,0.97) 0%, rgba(6,7,10,0.97) 100%)' }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <p className="m-0 text-xs uppercase tracking-[0.25em] text-[#b4dae7]">
                        {roomAction === 'create' ? '✅ Room créée' : '✅ Room rejointe'}
                    </p>
                    <h1 className="m-0 mt-3 text-lg font-semibold tracking-wide text-[#dff6ff]">
                        Code: <span className="font-mono text-[#50ff8c]">{roomId}</span>
                    </h1>

                    <div className="mt-6 rounded-lg px-4 py-3 text-center"
                         style={{ background: 'rgba(9,24,34,0.55)', borderColor: 'rgba(128,207,255,0.22)' }}>
                        <p className="m-0 text-xs text-[#b4dae7]/60">Partage le code:</p>
                        <p className="m-0 mt-2 text-xs font-mono text-[#e8f6ff] break-all">{roomId}</p>
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                        <motion.button
                            onClick={handleCopyCode}
                            className="rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide"
                            style={{ borderColor: 'rgba(128,207,255,0.44)', background: 'linear-gradient(180deg, rgba(128,207,255,0.16), rgba(35,73,96,0.35))', color: '#daf2ff' }}
                            whileHover={{ scale: 1.02 }}
                        >
                            {copied ? '✓ Copié' : '📋 Copier'}
                        </motion.button>

                        <motion.div
                            className="rounded-lg border px-4 py-3 text-center text-sm"
                            style={{ borderColor: 'rgba(128,207,255,0.22)', background: 'rgba(9,24,34,0.35)' }}
                            animate={{ opacity: [0.7, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <p className="m-0 text-[#b4dae7]">👥 {playerCount}/2 joueurs</p>
                        </motion.div>

                        <motion.button
                            onClick={toggleReady}
                            disabled={playerCount < 1}
                            className="rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition disabled:opacity-50"
                            style={{
                                borderColor: isReady ? 'rgba(80,255,140,0.65)' : 'rgba(255,200,87,0.44)',
                                background: isReady
                                    ? 'linear-gradient(180deg, rgba(80,255,140,0.24), rgba(25,85,48,0.36))'
                                    : 'linear-gradient(180deg, rgba(255,200,87,0.12), rgba(128,85,24,0.25))',
                                color: isReady ? '#e8ffef' : '#ffe8c0',
                            }}
                            whileHover={{ scale: 1.02 }}
                        >
                            {isReady ? '✓ Je suis prêt' : 'Me marquer prêt'}
                        </motion.button>

                        <motion.button
                            onClick={backToSelect}
                            className="rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide"
                            style={{ borderColor: 'rgba(255,255,255,0.18)', background: 'transparent', color: '#e8f6ff' }}
                            whileHover={{ scale: 1.02 }}
                        >
                            ← Retour
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default OnlineLobbyScreen;