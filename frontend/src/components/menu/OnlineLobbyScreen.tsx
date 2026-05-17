import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
    roomId: string;
    onRoomChange: (roomId: string) => void;
    onGenerateRoom: () => void;
    onStart: () => void;
    onBack: () => void;
}

function buildShareUrl(roomId: string) {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    return url.toString();
}

const OnlineLobbyScreen = ({ roomId, onRoomChange, onGenerateRoom, onStart, onBack }: Props) => {
    const [copied, setCopied] = useState(false);
    const shareUrl = buildShareUrl(roomId);

    const handleCopy = async () => {
        if (!shareUrl) return;
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
    };

    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center gap-8 select-none px-4"
             style={{ background: 'radial-gradient(circle at top, rgba(128,207,255,0.12) 0%, rgba(1,8,15,0.86) 40%, rgba(0,0,0,0.92) 100%)' }}>
            <motion.div
                className="relative w-full max-w-md overflow-hidden rounded-2xl border p-6 text-white"
                style={{ borderColor: 'rgba(128,207,255,0.35)', background: 'linear-gradient(165deg, rgba(5,11,18,0.97) 0%, rgba(6,7,10,0.97) 100%)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full"
                     style={{ background: 'radial-gradient(circle, rgba(128,207,255,0.22), rgba(128,207,255,0))' }} />

                <p className="m-0 text-xs uppercase tracking-[0.25em] text-[#b4dae7]">Jouer en ligne</p>
                <h1 className="m-0 mt-2 text-3xl font-semibold tracking-wide text-[#dff6ff]">Room de partie</h1>

                <div className="mt-5 flex flex-col gap-3">
                    <label className="text-xs uppercase tracking-[0.25em] text-[#b4dae7]">Code room</label>
                    <input
                        value={roomId}
                        onChange={(e) => onRoomChange(e.target.value)}
                        className="w-full rounded-lg border bg-black/30 px-3 py-2 text-sm text-white outline-none"
                        style={{ borderColor: 'rgba(128,207,255,0.35)' }}
                        placeholder="ABC12345"
                    />
                </div>

                <div className="mt-4 flex flex-col gap-2 rounded-xl border px-3 py-3 text-sm"
                     style={{ borderColor: 'rgba(128,207,255,0.22)', background: 'rgba(9,24,34,0.55)' }}>
                    <span className="text-[#b4dae7]">Lien à partager</span>
                    <span className="break-all text-[#e8f6ff]">{shareUrl}</span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                        onClick={handleCopy}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:scale-[1.02]"
                        style={{ borderColor: 'rgba(128,207,255,0.44)', background: 'linear-gradient(180deg, rgba(128,207,255,0.16), rgba(35,73,96,0.35))', color: '#daf2ff' }}
                    >
                        {copied ? 'Copié' : 'Copier le lien'}
                    </button>
                    <button
                        onClick={onGenerateRoom}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:scale-[1.02]"
                        style={{ borderColor: 'rgba(128,207,255,0.44)', background: 'linear-gradient(180deg, rgba(128,207,255,0.12), rgba(35,73,96,0.25))', color: '#daf2ff' }}
                    >
                        Nouvelle room
                    </button>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                        onClick={onStart}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:scale-[1.02]"
                        style={{ borderColor: 'rgba(80,255,140,0.65)', background: 'linear-gradient(180deg, rgba(80,255,140,0.24), rgba(25,85,48,0.36))', color: '#e8ffef' }}
                    >
                        Lancer la partie
                    </button>
                    <button
                        onClick={onBack}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:scale-[1.02]"
                        style={{ borderColor: 'rgba(255,255,255,0.18)', background: 'transparent', color: '#e8f6ff' }}
                    >
                        Retour
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default OnlineLobbyScreen;