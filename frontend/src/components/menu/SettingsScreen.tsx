import React from 'react';
import { motion } from 'framer-motion';
import type { GameSettings, Difficulty } from '../../types/GameTypes';

interface Props {
    settings: GameSettings;
    onChange: (s: GameSettings) => void;
    onBack:   () => void;
}

const SLOT_OPTIONS:  (3|4|5)[]   = [3, 4, 5];
const DIFF_OPTIONS: { value: Difficulty; label: string; color: string }[] = [
    { value: 'easy',   label: 'FACILE',  color: '#50ff8c' },
    { value: 'normal', label: 'NORMAL',  color: '#ffd700' },
    { value: 'hard',   label: 'DIFFICILE', color: '#ff5555' },
];

function Toggle<T extends string | number>({
    options, value, onSelect, colorFn,
}: {
    options: T[];
    value: T;
    onSelect: (v: T) => void;
    colorFn: (v: T) => string;
}) {
    return (
        <div className="flex gap-2">
            {options.map(opt => {
                const active = opt === value;
                const color  = colorFn(opt);
                return (
                    <motion.button key={String(opt)} onClick={() => onSelect(opt)}
                        className="px-5 py-2 rounded-lg font-[family-name:var(--font-orbitron)] font-black text-sm border-2 transition-all cursor-pointer"
                        style={{
                            borderColor: active ? color : color + '33',
                            color:       active ? '#000' : color,
                            background:  active ? color : 'transparent',
                        }}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {String(opt)}
                    </motion.button>
                );
            })}
        </div>
    );
}

const SettingsScreen: React.FC<Props> = ({ settings, onChange, onBack }) => (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center gap-10 select-none"
         style={{ background: 'radial-gradient(ellipse at top, #0d1b2a 0%, #000508 100%)' }}>

        <motion.h1
            className="font-[family-name:var(--font-orbitron)] text-3xl font-black tracking-[0.2em] text-[#80cfff] m-0"
            style={{ textShadow: '0 0 20px rgba(128,207,255,0.4)' }}
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            PARAMÈTRES
        </motion.h1>

        <motion.div className="flex flex-col gap-8 w-80 rounded-2xl border border-[#80cfff]/20 p-8"
            style={{ background: 'rgba(0,20,10,0.75)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

            {/* Nombre de slots */}
            <div className="flex flex-col gap-3">
                <label className="font-[family-name:var(--font-orbitron)] text-xs tracking-[0.2em] text-[#80cfff]/60 uppercase">
                    Emplacements nénuphars
                </label>
                <Toggle
                    options={SLOT_OPTIONS}
                    value={settings.slotsCount}
                    onSelect={v => onChange({ ...settings, slotsCount: v })}
                    colorFn={() => '#80cfff'}
                />
            </div>

            {/* Difficulté */}
            <div className="flex flex-col gap-3">
                <label className="font-[family-name:var(--font-orbitron)] text-xs tracking-[0.2em] text-[#80cfff]/60 uppercase">
                    Difficulté
                </label>
                <div className="flex gap-2 flex-wrap">
                    {DIFF_OPTIONS.map(({ value, label, color }) => {
                        const active = settings.difficulty === value;
                        return (
                            <motion.button key={value}
                                onClick={() => onChange({ ...settings, difficulty: value })}
                                className="px-4 py-2 rounded-lg font-[family-name:var(--font-orbitron)] font-black text-xs border-2 transition-all cursor-pointer"
                                style={{
                                    borderColor: active ? color : color + '33',
                                    color:       active ? '#000' : color,
                                    background:  active ? color : 'transparent',
                                }}
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                {label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </motion.div>

        <motion.button onClick={onBack}
            className="font-[family-name:var(--font-orbitron)] text-sm tracking-widest text-white/50 hover:text-white border border-white/20 hover:border-white/50 px-8 py-2 rounded-lg transition-all cursor-pointer"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            ← RETOUR
        </motion.button>
    </div>
);

export default SettingsScreen;
