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
  musicVolume: 35,      // 0-100
  sfxVolume: 100,       // 0-100

  loadAllSounds(): void {
    Object.entries(soundFiles).forEach(([name, src]) => {
      const prev = this.sounds[name];
      if (prev) {
        try { prev.unload(); } catch (e) { /* ignore */ }
      }
      const isMusic = name === 'soundtrack';
      this.sounds[name] = new Howl({
        src: [src],
        loop: isMusic,
        volume: isMusic ? this.musicVolume / 100 : this.sfxVolume / 100,
        preload: true,
      });
    });
  },

  setMusicVolume(percent: number): void {
    this.musicVolume = Math.max(0, Math.min(100, percent));
    const soundtrack = this.sounds.soundtrack;
    if (soundtrack) {
      soundtrack.volume(this.musicVolume / 100);
    }
  },

  setSfxVolume(percent: number): void {
    this.sfxVolume = Math.max(0, Math.min(100, percent));
    Object.entries(this.sounds).forEach(([name, sound]) => {
      if (name !== 'soundtrack' && sound) {
        sound.volume(this.sfxVolume / 100);
      }
    });
  },

  playSound(name: string): number | undefined {
    const sound = this.sounds[name];
    if (!sound) return undefined;
    // Pour la musique (soundtrack), vérifie si elle joue déjà
    if (name === 'soundtrack' && sound.playing()) {
      return undefined; // Déjà en cours de lecture
    }
    // Arrête tous les sons de même type avant de rejouer (évite les chevauchements)
    if (name === 'soundtrack') {
      sound.stop();
    }
    return sound.play() as number | undefined;
  },

  stopSound(name: string): void {
    this.sounds[name]?.stop();
  },
};

export default soundManager;