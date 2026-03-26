import { useEffect, useState } from 'react';
import { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

/**
 * Initialise le moteur tsParticles une seule fois pour toute l'app.
 * Retourne `true` quand le moteur est prêt à rendre des <Particles>.
 */
export function useParticlesInit(): boolean {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => setReady(true));
    }, []);

    return ready;
}
