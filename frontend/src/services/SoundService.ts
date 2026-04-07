import { Howl } from 'howler';

const soundManager: { sounds: Record<string, Howl>; loadSound: (name: string, src: string) => void; playSound: (name: string) => void; stopSound: (name: string) => void } = {
  sounds: {},

  // Charger un son
  loadSound: (name: string, src: string) => {
    const sound = new Howl({ src });
    soundManager.sounds[name] = sound;
  },

  // Jouer un son
  playSound: (name: string) => {
    const sound = soundManager.sounds[name];
    if (sound) sound.play();
  },

  // Arrêter un son
  stopSound: (name: string) => {
    const sound = soundManager.sounds[name];
    if (sound) sound.stop();
  },
};

export default soundManager;