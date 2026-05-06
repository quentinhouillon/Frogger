import { Howl } from 'howler';

const soundManager = {
  sounds: {} as Record<string, Howl>,

  loadSound(name: string, src: string[]): void {
    this.sounds[name] = new Howl({ src });
  },

  playSound(name: string): number | undefined {
    return this.sounds[name]?.play();
  },

  stopSound(name: string): void {
    this.sounds[name]?.stop();
  },
};

export default soundManager;