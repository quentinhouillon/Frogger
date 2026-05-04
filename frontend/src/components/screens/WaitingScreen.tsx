import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Props { onBack: () => void; }

const WaitingScreen: React.FC<Props> = ({ onBack }) => {
    const [copied, setCopied] = useState(false);

    const copyUrl = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6"
             style={{ background: 'radial-gradient(ellipse at center, rgba(0,40,60,0.85) 0%, rgba(0,0,0,0.92) 100%)' }}>

            <motion.span className="text-6xl"
                animate={{ y: [0, -14, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}>
                🐸
            </motion.span>

            <motion.p
                className="font-[family-name:var(--font-orbitron)] text-2xl font-black tracking-[0.15em] text-[#80cfff] m-0"
                style={{ textShadow: '0 0 20px rgba(128,207,255,0.5)' }}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}>
                EN ATTENTE D'UN ADVERSAIRE...
            </motion.p>

            <p className="font-[family-name:var(--font-orbitron)] text-xs tracking-[0.2em] text-white/40 m-0 text-center">
                Partage cette URL avec ton adversaire
            </p>

            <motion.button
                onClick={copyUrl}
                className="px-6 py-2 rounded-lg font-[family-name:var(--font-orbitron)] font-black text-sm tracking-widest border-2 transition-all cursor-pointer"
                style={{
                    borderColor: copied ? '#50ff8c' : '#80cfff55',
                    color:       copied ? '#50ff8c' : '#80cfff',
                    background:  'transparent',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}>
                {copied ? '✓ COPIÉ !' : '📋 COPIER L\'URL'}
            </motion.button>

            <motion.button
                onClick={onBack}
                className="font-[family-name:var(--font-orbitron)] text-xs tracking-widest text-white/30 hover:text-white/70 transition-colors cursor-pointer mt-2"
                whileHover={{ scale: 1.04 }}>
                ← RETOUR AU MENU
            </motion.button>
        </div>
    );
};

export default WaitingScreen;
