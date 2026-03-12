import React, { useEffect, useState } from 'react';
import { wsService } from './services/WebsocketService'; // Assure-toi que le chemin est bon
import type { GameState } from './types/GameTypes';


const Game: React.FC = () => {
    // Le State pour stocker les données reçues du serveur
    const [gameState, setGameState] = useState<GameState | null>(null);

    useEffect(() => {
        // A. On lance la connexion
        wsService.connect('ws://localhost:8080');

        // B. On s'abonne aux mises à jour
        // Grâce à ton code, 'subscribe' nous renvoie une fonction de nettoyage !
        const unsubscribe = wsService.subscribe((data: GameState) => {
            setGameState(data);
        });

        // C. Nettoyage quand le composant est détruit
        return () => {
            unsubscribe();       // On arrête d'écouter
            wsService.disconnect(); // On coupe le websocket
        };
    }, []);

    // Si on n'a pas encore reçu de données
    if (!gameState) {
        return <div className="loading">Connexion au serveur Frogger...</div>;
    }

    // 2. Le Rendu
    return (
        <div className="game-container" style={{ position: 'relative', width: 600, height: 600, background: '#333', overflow: 'hidden' }}>
            
            {/* Affiche le Score */}
            <div style={{ position: 'absolute', top: 10, left: 10, color: 'white', zIndex: 100 }}>
                Score: {gameState.score}
            </div>

            {/* Affiche les Lignes (Lanes) */}
            {gameState.lanes.map((lane, index) => (
                // Ici, on pourrait appeler un composant <Lane />
                <div key={index} style={{
                    position: 'absolute',
                    top: lane.positionY,
                    left: 0,
                    width: '100%',
                    height: 50, // Hauteur arbitraire, à ajuster selon ton backend
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                    // Astuce : Ajoute une couleur de fond différente selon lane.type !
                }}>
                    {/* Affiche les Obstacles de cette ligne */}
                    {lane.obstacles.map((obs, i) => (
                         // Ici, on pourrait appeler un composant <Obstacle />
                        <div key={i} style={{
                            position: 'absolute',
                            left: obs.x,
                            top: 0, // Relatif à la ligne
                            width: obs.width,
                            height: obs.height,
                            backgroundColor: obs.type === 'CAR' ? 'red' : 'brown'
                        }} />
                    ))}
                </div>
            ))}

            {/* Affiche la Grenouille */}
            <div style={{
                position: 'absolute',
                left: gameState.frog.x,
                top: gameState.frog.y,
                width: gameState.frog.width,
                height: gameState.frog.height,
                backgroundColor: 'lime',
                borderRadius: '50%'
            }} />

        </div>
    );
};

export default Game;