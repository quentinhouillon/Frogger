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

const DEFAULT_SETTINGS: GameSettings = { slotsCount: 5, difficulty: 'normal', mode: 'single' };

function App() {
    const [screen,     setScreen]     = useState<Screen>('menu');
    const [settings,   setSettings]   = useState<GameSettings>(DEFAULT_SETTINGS);
    const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);

    // Ref pour éviter les problèmes de batching lors du changement mode + screen
    const pendingMode = useRef<GameMode>('single');

    useEffect(() => {
        soundManager.loadAllSounds();
        wsService.connect(getWebSocketUrl());
        const unsub = wsService.subscribe((data: GameState) => {
            if (data.highScores) setHighScores(data.highScores);
        });
        return () => unsub();
    }, []);

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
