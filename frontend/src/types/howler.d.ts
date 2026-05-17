declare module 'howler' {
  export class Howl {
    constructor(options: HowlOptions);
    play(soundId?: string | number): string | number;
    pause(soundId?: string | number): Howl;
    stop(soundId?: string | number): Howl;
    mute(muted?: boolean, soundId?: string | number): Howl | boolean;
    volume(vol?: number, soundId?: string | number): Howl | number;
    fade(from: number, to: number, duration: number, soundId?: string | number): Howl;
    fade(from: number, to: number, duration: number, callback?: () => void): Howl;
    playing(soundId?: string | number): boolean;
    duration(soundId?: string | number): number;
    seek(seek?: number, soundId?: string | number): Howl | number;
    loop(loop?: boolean, soundId?: string | number): Howl | boolean;
    rate(rate?: number, soundId?: string | number): Howl | number;
    on(event: string, fn: () => void, soundId?: string | number): Howl;
    once(event: string, fn: () => void, soundId?: string | number): Howl;
    off(event: string, fn?: () => void, soundId?: string | number): Howl;
    unload(): Howl;
  }

  export interface HowlOptions {
    src: string | string[];
    autoplay?: boolean;
    mute?: boolean;
    loop?: boolean;
    volume?: number;
    rate?: number;
    preload?: boolean | 'metadata' | 'none';
    html5?: boolean;
    pool?: number;
    format?: string[];
    sprite?: { [key: string]: [number, number] };
    onload?: () => void;
    onloaderror?: (soundId: string | number, error: any) => void;
    onplay?: (soundId?: string | number) => void;
    onstop?: (soundId?: string | number) => void;
    onpause?: (soundId?: string | number) => void;
    onend?: (soundId?: string | number) => void;
  }

  export const Howler: {
    mute(muted?: boolean): boolean | typeof Howler;
    unmute(): typeof Howler;
    volume(vol?: number): number | typeof Howler;
    codecs(ext: string): boolean | string;
    unload(): typeof Howler;
    usingWebAudio: boolean;
    usingHTML5: boolean;
    iosSafariHfix: boolean;
  };
}
