import { useEffect, useRef, useState } from 'react';
import './App.css';

import Game           from './Game';
import MenuScreen     from './components/menu/MenuScreen';
import ScoresScreen   from './components/menu/ScoresScreen';
import SettingsScreen from './components/menu/SettingsScreen';
import CreditsScreen  from './components/menu/CreditsScreen';

import { getWebSocketUrl, wsService } from './services/WebsocketService';
import soundManager from './services/SoundService';
import type { GameSettings, GameMode, HighScoreEntry, GameState } from './types/GameTypes';

export type Screen = 'menu' | 'game' | 'scores' | 'settings' | 'credits';

const DEFAULT_SETTINGS: GameSettings = { slotsCount: 5, difficulty: 'normal', mode: 'single', musicVolume: 35, sfxVolume: 100 };

function App() {
    const [screen,     setScreen]     = useState<Screen>('menu');
    const [settings,   setSettings]   = useState<GameSettings>(DEFAULT_SETTINGS);
    const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);

    // Ref pour éviter les problèmes de batching lors du changement mode + screen
    const pendingMode = useRef<GameMode>('single');

    useEffect(() => {
        // Charge les sons une seule fois au démarrage
        soundManager.loadAllSounds();
        soundManager.setMusicVolume(settings.musicVolume);
        soundManager.setSfxVolume(settings.sfxVolume);
        wsService.connect(getWebSocketUrl());
        const unsub = wsService.subscribe((data: GameState) => {
            if (data.highScores) setHighScores(data.highScores);
        });
        return () => unsub();
    }, []);

    // Met à jour les volumes quand ils changent
    useEffect(() => {
        soundManager.setMusicVolume(settings.musicVolume);
        soundManager.setSfxVolume(settings.sfxVolume);
    }, [settings.musicVolume, settings.sfxVolume]);

    // Gère la musique: reste jouée pour tous les écrans sauf le jeu (évite relances entre sous-menus)
    useEffect(() => {
        if (screen === 'game') {
            soundManager.stopSound('soundtrack');
        } else {
            // playSound est idempotent (ne relance pas si déjà en cours)
            soundManager.playSound('soundtrack');
        }
    }, [screen]);

    const navigate    = (s: Screen) => setScreen(s);

    const handlePlay  = (mode: GameMode) => {
        pendingMode.current = mode;
        setSettings(s => ({ ...s, mode }));
        setScreen('game');
    };

    switch (screen) {
        case 'menu':
            return <MenuScreen onNavigate={navigate} onPlay={handlePlay} />;
        case 'scores':
            return <ScoresScreen highScores={highScores} onBack={() => navigate('menu')} />;
        case 'settings':
            return <SettingsScreen settings={settings} onChange={setSettings} onBack={() => navigate('menu')} />;
        case 'credits':
            return <CreditsScreen onBack={() => navigate('menu')} />;
        case 'game':
            return <Game
                settings={{ ...settings, mode: pendingMode.current }}
                onBackToMenu={() => navigate('menu')}
            />;
    }
}

export default App;
