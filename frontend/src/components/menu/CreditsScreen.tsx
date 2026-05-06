import React from 'react';
import { motion } from 'framer-motion';

interface Props {
    onBack: () => void;
}

const team = [
    { role: 'Ingénieur logiciel', name: 'Daril DJODJO KOUTON' },
    { role: 'Ingénieur logiciel', name: 'Quentin HOUILLON' },
    { role: 'Chef de projet', name: 'Leticia ALKILAL' },
];

const CreditsScreen: React.FC<Props> = ({ onBack }) => (
    <div
        className="fixed inset-0 z-[9999] flex items-center justify-center px-4 min-h-screen"
        style={{
            background: 'radial-gradient(circle at top, rgba(80,255,140,0.12) 0%, rgba(1,8,5,0.86) 40%, rgba(0,0,0,0.92) 100%)',
            backdropFilter: 'blur(5px)',
        }}
    >
        <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border p-6 text-white"
            style={{
                borderColor: 'rgba(207,159,255,0.35)',
                background: 'linear-gradient(165deg, rgba(5,18,11,0.97) 0%, rgba(6,10,7,0.97) 100%)',
                boxShadow: '0 0 0 1px rgba(15,24,16,0.9), 0 0 50px rgba(207,159,255,0.16), 0 20px 60px rgba(0,0,0,0.75)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(207,159,255,0.22), rgba(207,159,255,0))' }}
            />

            <div className="mb-5">
                <p className="m-0 text-xs uppercase tracking-[0.25em] text-[#cf9fff]">Frogger</p>
                <h1 className="m-0 text-3xl font-semibold tracking-wide text-[#dfffe9]">Crédits</h1>
            </div>

            <div className="mb-5 rounded-xl border px-3 py-2" style={{ borderColor: 'rgba(207,159,255,0.22)', background: 'rgba(9,24,14,0.55)' }}>
                <p className="m-0 text-sm text-[#b4e7c6]">🐸 Projet L3 — Programmation Orientée Objet</p>
            </div>

            <div className="space-y-4 mb-6">
                <div className="border-t border-white/10" />

                {team.map(({ role, name }, i) => (
                    <motion.div
                        key={i}
                        className="flex flex-col gap-1"
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                    >
                        <span className="text-[0.65rem] tracking-[0.2em] text-[#cf9fff]/60 uppercase font-semibold">
                            {role}
                        </span>
                        <span className="text-sm font-semibold text-[#e8ffef]">{name}</span>
                    </motion.div>
                ))}

                <div className="border-t border-white/10 pt-3" />

                <div className="flex flex-col gap-2">
                    <span className="text-[0.65rem] tracking-[0.2em] text-[#cf9fff]/60 uppercase font-semibold">
                        Stack technique
                    </span>
                    {['Java 21 + WebSocket', 'React 19 + TypeScript', 'Framer Motion + Tailwind'].map((tech, i) => (
                        <span key={i} className="text-xs text-[#b4e7c6]">• {tech}</span>
                    ))}
                </div>
            </div>

            <button
                onClick={onBack}
                className="w-full rounded-lg border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:scale-[1.02]"
                style={{
                    borderColor: 'rgba(207,159,255,0.65)',
                    background: 'linear-gradient(180deg, rgba(207,159,255,0.24), rgba(85,25,85,0.36))',
                    color: '#f0e8ff',
                }}
            >
                ← Retour
            </button>
        </motion.div>
    </div>
);

export default CreditsScreen;
