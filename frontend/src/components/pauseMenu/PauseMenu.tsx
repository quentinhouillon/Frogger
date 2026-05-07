import { useState } from 'react'
import type { FC } from 'react'
import type { GameSettings } from '../../types/GameTypes';
import soundManager from '../../services/SoundService';

interface Props {
    isPaused: boolean
    onResume: () => void
    onRestart: () => void
    onMenu: () => void
    settings: GameSettings
    onSettingsChange: (newSettings: GameSettings) => void
}

export const PauseMenu: FC<Props> = ({ isPaused, onResume, onRestart, onMenu, settings, onSettingsChange }) => {
    const [showAudioSettings, setShowAudioSettings] = useState(false)

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
                </div>

                <div className="mb-5 rounded-xl border px-3 py-2" style={{ borderColor: 'rgba(80,255,140,0.22)', background: 'rgba(9,24,14,0.55)' }}>
                    <p className="m-0 text-sm text-[#b4e7c6]">Partie en pause. Appuie sur ESC pour reprendre rapidement.</p>
                </div>

                {/* Audio Settings Section */}
                {showAudioSettings ? (
                    <div className="mb-5 p-4 rounded-lg border" style={{ borderColor: 'rgba(140,219,255,0.35)', background: 'rgba(5,11,18,0.55)' }}>
                        <label className="text-xs uppercase tracking-[0.25em] text-[#b4dae7] block mb-2">
                            Volume Effets: {settings.sfxVolume}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.sfxVolume}
                            onChange={(e) => {
                                const newVol = Number(e.target.value);
                                soundManager.setSfxVolume(newVol);
                                onSettingsChange({ ...settings, sfxVolume: newVol });
                            }}
                            className="h-2 w-full cursor-pointer rounded-lg appearance-none bg-gradient-to-r from-transparent via-[rgba(140,219,255,0.4)] to-transparent"
                            style={{ accentColor: 'rgba(140,219,255,0.8)' }}
                        />
                    </div>
                ) : (
                    <div className="mb-5 rounded-xl border px-3 py-2" style={{ borderColor: 'rgba(80,255,140,0.22)', background: 'rgba(9,24,14,0.55)' }}>
                        <button
                            onClick={() => setShowAudioSettings(true)}
                            className="w-full text-sm text-left text-[#b4e7c6] hover:text-[#e8ffef] transition"
                        >
                            🔊 Paramètres audio
                        </button>
                    </div>
                )}

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