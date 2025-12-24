import { useGameStore } from '../store/gameStore';
import { INITIAL_BALANCE } from '../constants';

export const GameOverScreen = () => {
    const { isGameOver, gameOverReason, resetGame, totalEquity } = useGameStore();

    if (!isGameOver) return null;

    const isBankrupt = gameOverReason === 'bankrupt';
    const finalValue = totalEquity;
    const profitPercent = ((finalValue - INITIAL_BALANCE) / INITIAL_BALANCE * 100);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-2xl p-8 shadow-2xl border border-emerald-900/50 max-w-md w-full mx-4 text-center">
                {/* Icon */}
                <div className="text-6xl mb-4">
                    {isBankrupt ? '💸' : '🏆'}
                </div>

                {/* Title */}
                <h1 className={`text-3xl font-bold mb-2 ${isBankrupt ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isBankrupt ? 'Game Over' : 'Congratulations!'}
                </h1>

                {/* Subtitle */}
                <p className="text-gray-400 mb-6">
                    {isBankrupt
                        ? 'You went bankrupt! All your funds are gone.'
                        : 'You made it to December 2025!'}
                </p>

                {/* Results */}
                <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-emerald-900/30">
                    <div className="text-sm text-gray-400 mb-1">Final Portfolio Value</div>
                    <div className={`text-2xl font-mono font-bold ${finalValue >= INITIAL_BALANCE ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${finalValue.toFixed(2)}
                    </div>
                    {!isBankrupt && (
                        <div className={`text-sm mt-1 ${profitPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}% from start
                        </div>
                    )}
                </div>

                {/* Try Again Button */}
                <button
                    onClick={resetGame}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25"
                >
                    🔄 Try Again
                </button>

                {/* Starting balance reminder */}
                <p className="text-xs text-gray-500 mt-4">
                    You'll start again with ${INITIAL_BALANCE.toLocaleString()}
                </p>
            </div>
        </div>
    );
};
