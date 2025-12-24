import { useState, useEffect } from 'react';
import { useAudioStore } from '../store/audioStore';

export const SettingsButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { bgmEnabled, sfxEnabled, toggleBgm, toggleSfx, initBgm, bgmAudio } = useAudioStore();

    // Initialize BGM on mount
    useEffect(() => {
        initBgm();
    }, [initBgm]);

    // Handle first user interaction to start BGM (browser autoplay policy)
    useEffect(() => {
        const handleFirstInteraction = () => {
            if (bgmEnabled && bgmAudio) {
                bgmAudio.play().catch(console.error);
            }
            // Remove listeners after first interaction
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };

        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);

        return () => {
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };
    }, [bgmEnabled, bgmAudio]);

    return (
        <>
            {/* Settings Button */}
            <button
                id="settings-button"
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-20 z-50 w-12 h-12 bg-slate-700 hover:bg-slate-600 text-white rounded-full shadow-lg flex items-center justify-center text-xl transition-all hover:scale-110"
                title="Audio Settings"
            >
                ⚙️
            </button>

            {/* Settings Panel */}
            {isOpen && (
                <div className="fixed bottom-20 right-4 z-50 bg-gradient-to-br from-slate-900 to-emerald-950 rounded-lg p-4 shadow-2xl border border-emerald-900/30 min-w-[200px]">
                    <h3 className="text-emerald-400 font-bold mb-4 text-sm">Audio Settings</h3>

                    {/* BGM Toggle */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 text-sm">🎵 Music</span>
                        <button
                            onClick={toggleBgm}
                            className={`w-12 h-6 rounded-full transition-colors relative ${bgmEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                                }`}
                        >
                            <div
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${bgmEnabled ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* SFX Toggle */}
                    <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">🔊 Sound FX</span>
                        <button
                            onClick={toggleSfx}
                            className={`w-12 h-6 rounded-full transition-colors relative ${sfxEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                                }`}
                        >
                            <div
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${sfxEnabled ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
