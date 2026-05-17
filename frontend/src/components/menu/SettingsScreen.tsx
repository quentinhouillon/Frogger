import React from 'react';
import { motion } from 'framer-motion';
import type { GameSettings, Difficulty } from '../../types/GameTypes';

interface Props {
    settings: GameSettings;
    onChange: (s: GameSettings) => void;
    onBack: () => void;
}

const SLOT_OPTIONS: (3 | 4 | 5)[] = [3, 4, 5];
const DIFF_OPTIONS: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: 'FACILE' },
    { value: 'normal', label: 'NORMAL' },
    { value: 'hard', label: 'DIFFICILE' },
];

function Toggle<T extends string | number>({
    options,
    value,
    onSelect,
}: {
    options: T[];
    value: T;
    onSelect: (v: T) => void;
}) {
    return (
        <div className="flex gap-2">
            {options.map((opt) => {
                const active = opt === value;
                return (
                    <motion.button
                        key={String(opt)}
                        onClick={() => onSelect(opt)}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:scale-[1.02]"
                        style={{
                            borderColor: active ? 'rgba(140,219,255,0.65)' : 'rgba(140,219,255,0.22)',
                            background: active
                                ? 'linear-gradient(180deg, rgba(140,219,255,0.24), rgba(25,73,96,0.36))'
                                : 'transparent',
                            color: active ? '#e8f6ff' : '#b4dae7',
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {String(opt)}
                    </motion.button>
                );
            })}
        </div>
    );
}

const SettingsScreen: React.FC<Props> = ({ settings, onChange, onBack }) => (
    <div
        className="min-h-screen w-screen flex flex-col items-center justify-center gap-10 select-none px-4"
        style={{
            background:
                'radial-gradient(circle at top, rgba(140,219,255,0.12) 0%, rgba(1,8,15,0.86) 40%, rgba(0,0,0,0.92) 100%)',
            backdropFilter: 'blur(5px)',
        }}
    >
        <motion.h1
            className="m-0 text-3xl font-semibold tracking-wide uppercase text-[#dff6ff]"
            style={{ textShadow: '0 0 20px rgba(140,219,255,0.3)' }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
        >
            Paramètres
        </motion.h1>

        <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border p-6 text-white"
            style={{
                borderColor: 'rgba(140,219,255,0.35)',
                background: 'linear-gradient(165deg, rgba(5,11,18,0.97) 0%, rgba(6,7,10,0.97) 100%)',
                boxShadow:
                    '0 0 0 1px rgba(15,16,24,0.9), 0 0 50px rgba(140,219,255,0.16), 0 20px 60px rgba(0,0,0,0.75)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <div
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(140,219,255,0.22), rgba(140,219,255,0))' }}
            />

            {/* Nombre de slots */}
            <div className="mb-5 flex flex-col gap-3">
                <label className="text-xs uppercase tracking-[0.25em] text-[#b4dae7]">
                    Emplacements nénuphars
                </label>
                <Toggle
                    options={SLOT_OPTIONS}
                    value={settings.slotsCount}
                    onSelect={(v) => onChange({ ...settings, slotsCount: v })}
                />
            </div>

            {/* Difficulté */}
            <div className="mb-5 flex flex-col gap-3">
                <label className="text-xs uppercase tracking-[0.25em] text-[#b4dae7]">Difficulté</label>
                <div className="flex gap-2 flex-wrap">
                    {DIFF_OPTIONS.map(({ value, label }) => {
                        const active = settings.difficulty === value;
                        const colorMap = {
                            easy: { border: 'rgba(80,255,140,0.65)', bg: 'rgba(80,255,140,0.24)' },
                            normal: { border: 'rgba(255,219,92,0.5)', bg: 'rgba(255,219,92,0.2)' },
                            hard: { border: 'rgba(255,80,80,0.6)', bg: 'rgba(255,80,80,0.18)' },
                        };
                        const colors = colorMap[value];

                        return (
                            <motion.button
                                key={value}
                                onClick={() => onChange({ ...settings, difficulty: value })}
                                className="rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:scale-[1.02]"
                                style={{
                                    borderColor: active ? colors.border : colors.border + '33',
                                    background: active
                                        ? `linear-gradient(180deg, ${colors.bg}, rgba(25,85,48,0.36))`
                                        : 'transparent',
                                    color:
                                        value === 'easy'
                                            ? active
                                                ? '#e8ffef'
                                                : '#9decb8'
                                            : value === 'normal'
                                              ? active
                                                  ? '#fff6d1'
                                                  : '#fdd76d'
                                              : active
                                                ? '#ffb3b3'
                                                : '#ff9999',
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Volume Musique */}
            <div className="mb-5 flex flex-col gap-3">
                <label className="text-xs uppercase tracking-[0.25em] text-[#b4dae7]">
                    Volume Musique: {settings.musicVolume}%
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.musicVolume}
                    onChange={(e) => onChange({ ...settings, musicVolume: Number(e.target.value) })}
                    className="h-2 w-full cursor-pointer rounded-lg appearance-none bg-gradient-to-r from-transparent via-[rgba(140,219,255,0.4)] to-transparent"
                    style={{
                        accentColor: 'rgba(140,219,255,0.8)',
                    }}
                />
            </div>

            {/* Volume Effets Sonores */}
            <div className="flex flex-col gap-3">
                <label className="text-xs uppercase tracking-[0.25em] text-[#b4dae7]">
                    Volume Effets: {settings.sfxVolume}%
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sfxVolume}
                    onChange={(e) => onChange({ ...settings, sfxVolume: Number(e.target.value) })}
                    className="h-2 w-full cursor-pointer rounded-lg appearance-none bg-gradient-to-r from-transparent via-[rgba(140,219,255,0.4)] to-transparent"
                    style={{
                        accentColor: 'rgba(140,219,255,0.8)',
                    }}
                />
            </div>
        </motion.div>

        <motion.button
            onClick={onBack}
            className="rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:scale-[1.02]"
            style={{
                borderColor: 'rgba(140,219,255,0.44)',
                background: 'linear-gradient(180deg, rgba(140,219,255,0.16), rgba(35,73,96,0.35))',
                color: '#daf2ff',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
        >
            ← Retour
        </motion.button>
    </div>
);

export default SettingsScreen;
