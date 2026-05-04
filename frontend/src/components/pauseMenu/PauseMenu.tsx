import React, { useState } from 'react'

interface Props {
    isPaused: boolean
    onResume: () => void
    onRestart: () => void
    onMenu: () => void
}

export const PauseMenu: React.FC<Props> = ({ isPaused, onResume, onRestart, onMenu }) => {
    const [isMuted, setIsMuted] = useState(false)

    if (!isPaused) return null

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            style={{
                background: 'radial-gradient(circle at top, rgba(80,255,140,0.12) 0%, rgba(1,8,5,0.86) 40%, rgba(0,0,0,0.92) 100%)',
                backdropFilter: 'blur(5px)',
            }}
        >
            <div
                className="relative w-full max-w-md overflow-hidden rounded-2xl border p-6 text-white"
                style={{
                    borderColor: 'rgba(80,255,140,0.35)',
                    background: 'linear-gradient(165deg, rgba(5,18,11,0.97) 0%, rgba(6,10,7,0.97) 100%)',
                    boxShadow: '0 0 0 1px rgba(15,24,16,0.9), 0 0 50px rgba(80,255,140,0.16), 0 20px 60px rgba(0,0,0,0.75)',
                }}
            >
                <div
                    className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(80,255,140,0.22), rgba(80,255,140,0))' }}
                />

                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <p className="m-0 text-xs uppercase tracking-[0.25em] text-[#9decb8]">Frogger</p>
                        <h1 className="m-0 text-3xl font-semibold tracking-wide text-[#dfffe9]">Pause</h1>
                    </div>

                    <button
                        type="button"
                        aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
                        onClick={() => setIsMuted((prev) => !prev)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border transition"
                        style={{
                            borderColor: isMuted ? 'rgba(255,116,116,0.7)' : 'rgba(80,255,140,0.45)',
                            background: isMuted ? 'rgba(255,80,80,0.14)' : 'rgba(80,255,140,0.12)',
                            boxShadow: isMuted ? '0 0 18px rgba(255,80,80,0.25)' : '0 0 18px rgba(80,255,140,0.2)',
                        }}
                    >
                        {isMuted ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M4 10V14H8L13 19V5L8 10H4Z" stroke="#ffb3b3" strokeWidth="1.8" strokeLinejoin="round" />
                                <path d="M18 9L21 12L18 15" stroke="#ff8c8c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M21 9L18 12L21 15" stroke="#ff8c8c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M4 10V14H8L13 19V5L8 10H4Z" stroke="#baf7cf" strokeWidth="1.8" strokeLinejoin="round" />
                                <path d="M16 9C16.9 9.9 17.5 10.9 17.5 12C17.5 13.1 16.9 14.1 16 15" stroke="#8af3b2" strokeWidth="1.8" strokeLinecap="round" />
                                <path d="M18.8 6.8C20.5 8.5 21.4 10.2 21.4 12C21.4 13.8 20.5 15.5 18.8 17.2" stroke="#75e9a0" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        )}
                    </button>
                </div>

                <div className="mb-5 rounded-xl border px-3 py-2" style={{ borderColor: 'rgba(80,255,140,0.22)', background: 'rgba(9,24,14,0.55)' }}>
                    <p className="m-0 text-sm text-[#b4e7c6]">Partie en pause. Appuie sur ESC pour reprendre rapidement.</p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <button
                        onClick={onResume}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:scale-[1.02]"
                        style={{
                            borderColor: 'rgba(80,255,140,0.65)',
                            background: 'linear-gradient(180deg, rgba(80,255,140,0.24), rgba(25,85,48,0.36))',
                            color: '#e8ffef',
                        }}
                    >
                        Reprendre
                    </button>
                    <button
                        onClick={onRestart}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:scale-[1.02]"
                        style={{
                            borderColor: 'rgba(255,219,92,0.5)',
                            background: 'linear-gradient(180deg, rgba(255,219,92,0.2), rgba(122,93,18,0.34))',
                            color: '#fff6d1',
                        }}
                    >
                        Restart
                    </button>
                    <button
                        onClick={onMenu}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:scale-[1.02]"
                        style={{
                            borderColor: 'rgba(140,219,255,0.44)',
                            background: 'linear-gradient(180deg, rgba(140,219,255,0.16), rgba(35,73,96,0.35))',
                            color: '#daf2ff',
                        }}
                    >
                        Menu
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PauseMenu