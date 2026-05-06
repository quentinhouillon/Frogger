import { Howl } from 'howler';
import moveSound from '../assets/Sounds/A_move.wav';
import deathSound from '../assets/Sounds/A_death.wav';
import extraScoreSound from '../assets/Sounds/A_extra_score.wav';
import frogPickupSound from '../assets/Sounds/A_frog_pick_up.wav';
import soundtrack from '../assets/Sounds/A_soundtrack.wav';

const soundFiles: Record<string, string> = {
  move: moveSound,
  death: deathSound,
  extraScore: extraScoreSound,
  frogPickup: frogPickupSound,
  soundtrack,
};

const soundManager = {
  sounds: {} as Record<string, Howl>,

  loadAllSounds(): void {
    Object.entries(soundFiles).forEach(([name, src]) => {
      this.sounds[name] = new Howl({
        src: [src],
        loop: name === 'soundtrack',
        volume: name === 'soundtrack' ? 0.35 : 1.0,
        preload: true,
      });
    });
  },

  playSound(name: string): number | undefined {
    return this.sounds[name]?.play();
  },

  stopSound(name: string): void {
    this.sounds[name]?.stop();
  },
};

export default soundManager;