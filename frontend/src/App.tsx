import { useEffect, useState } from 'react';
import './App.css';
import Game          from './Game';
import { wsService }  from './services/WebsocketService';
import type { GameSettings, HighScoreEntry, GameState } from './types/GameTypes';

export type Screen = 'menu' | 'game' | 'scores' | 'settings' | 'credits';

const DEFAULT_SETTINGS: GameSettings = { slotsCount: 5, difficulty: 'normal' };

function App() {
    const [screen,     setScreen]     = useState<Screen>('menu');
    const [settings,   setSettings]   = useState<GameSettings>(DEFAULT_SETTINGS);
    const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);

    // Connexion au WS dès le démarrage pour récupérer les scores même depuis le menu
    useEffect(() => {
        wsService.connect('ws://localhost:8080');
        const unsub = wsService.subscribe((data: GameState) => {
            if (data.highScores) setHighScores(data.highScores);
        });
        return () => unsub();
    }, []);

    const navigate = (s: Screen) => setScreen(s);

    switch (screen) {
        case 'game':
            return <Game settings={settings} onBackToMenu={() => navigate('menu')} />;
    }
}

export default App;