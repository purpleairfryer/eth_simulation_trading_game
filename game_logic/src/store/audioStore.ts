import { create } from 'zustand';

interface AudioState {
    bgmEnabled: boolean;
    sfxEnabled: boolean;
    bgmVolume: number;
    sfxVolume: number;
    bgmAudio: HTMLAudioElement | null;
    toggleBgm: () => void;
    toggleSfx: () => void;
    setBgmVolume: (volume: number) => void;
    setSfxVolume: (volume: number) => void;
    initBgm: () => void;
    playSfx: () => void;
}

const AUDIO_SETTINGS_KEY = 'crypto-sim-audio-settings';

// Load saved settings from localStorage
const loadSettings = () => {
    try {
        const saved = localStorage.getItem(AUDIO_SETTINGS_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load audio settings:', e);
    }
    return { bgmEnabled: true, sfxEnabled: true, bgmVolume: 0.3, sfxVolume: 0.5 };
};

const savedSettings = loadSettings();

export const useAudioStore = create<AudioState>((set, get) => ({
    bgmEnabled: savedSettings.bgmEnabled,
    sfxEnabled: savedSettings.sfxEnabled,
    bgmVolume: savedSettings.bgmVolume,
    sfxVolume: savedSettings.sfxVolume,
    bgmAudio: null,

    initBgm: () => {
        const state = get();
        if (state.bgmAudio) return; // Already initialized

        const audio = new Audio('/bgm/synthwave-80s-retro-background-music-400483.mp3');
        audio.loop = true;
        audio.volume = state.bgmVolume;

        set({ bgmAudio: audio });

        // Auto-play if enabled (needs user interaction first)
        if (state.bgmEnabled) {
            // Try to play, but it may fail due to autoplay policy
            audio.play().catch(() => {
                // Will play after first user interaction
                console.log('BGM will play after user interaction');
            });
        }
    },

    toggleBgm: () => {
        const state = get();
        const newEnabled = !state.bgmEnabled;

        if (state.bgmAudio) {
            if (newEnabled) {
                state.bgmAudio.play().catch(console.error);
            } else {
                state.bgmAudio.pause();
            }
        }

        set({ bgmEnabled: newEnabled });

        // Save to localStorage
        const settings = {
            bgmEnabled: newEnabled,
            sfxEnabled: state.sfxEnabled,
            bgmVolume: state.bgmVolume,
            sfxVolume: state.sfxVolume
        };
        localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
    },

    toggleSfx: () => {
        const state = get();
        const newEnabled = !state.sfxEnabled;

        set({ sfxEnabled: newEnabled });

        // Save to localStorage
        const settings = {
            bgmEnabled: state.bgmEnabled,
            sfxEnabled: newEnabled,
            bgmVolume: state.bgmVolume,
            sfxVolume: state.sfxVolume
        };
        localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
    },

    setBgmVolume: (volume: number) => {
        const state = get();
        if (state.bgmAudio) {
            state.bgmAudio.volume = volume;
        }
        set({ bgmVolume: volume });
    },

    setSfxVolume: (volume: number) => {
        set({ sfxVolume: volume });
    },

    playSfx: () => {
        const state = get();
        if (!state.sfxEnabled) return;

        // Use the same SFX for both trade and close
        const audio = new Audio('/sfx/cash-register-purchase-87313.mp3');
        audio.volume = state.sfxVolume;
        audio.play().catch(console.error);
    }
}));
