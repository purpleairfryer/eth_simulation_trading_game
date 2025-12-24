import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAudioStore } from '../store/audioStore';
import { calculatePnL } from '../utils/pnl';
import { POSITION_PERCENTAGES, LEVERAGE_UNLOCK_THRESHOLD, GAME_SPEED, SPEED_MULTIPLIERS } from '../constants';

export const TradingPanel = () => {
  const {
    balance,
    currentPrice,
    positions,
    openPosition,
    isPlaying,
    startGame,
    pauseGame,
    gameSpeed,
    setGameSpeed,
    leverageUnlocked
  } = useGameStore();

  // Calculate portfolio value (sum of position sizes + unrealized P&L)
  const portfolioValue = positions.reduce((total, position) => {
    const { dollarPnL } = calculatePnL(position, currentPrice);
    return total + position.size + dollarPnL;
  }, 0);

  const [percentage, setPercentage] = useState(50);
  const [leverage, setLeverage] = useState(1);

  // Calculate current speed multiplier from gameSpeed
  const currentSpeedMultiplier = gameSpeed / GAME_SPEED;

  const positionSize = (balance * percentage) / 100;

  const playSfx = useAudioStore((state) => state.playSfx);

  const handleLong = () => {
    if (balance > 0) {
      openPosition('long', percentage, leverage);
      playSfx();
    }
  };

  const handleShort = () => {
    if (balance > 0) {
      openPosition('short', percentage, leverage);
      playSfx();
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-lg p-4 shadow-xl border border-emerald-900/30 h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        {/* Account Info - Single row with 3 items */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-emerald-900/20">
            <div className="text-xs text-gray-400 mb-1">Total</div>
            <div className="text-sm font-mono text-emerald-400">${(balance + portfolioValue).toFixed(2)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-emerald-900/20">
            <div className="text-xs text-gray-400 mb-1">Cash</div>
            <div className="text-sm font-mono text-white">${balance.toFixed(2)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-emerald-900/20">
            <div className="text-xs text-gray-400 mb-1">Open Positions</div>
            <div className="text-sm font-mono text-white">${portfolioValue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Percentage Slider */}
      <div id="position-size" className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">
          Position Size: {percentage}% of balance
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {POSITION_PERCENTAGES.map(pct => (
            <button
              key={pct}
              onClick={() => setPercentage(pct)}
              className={`flex-1 min-w-[45px] py-3 rounded-lg text-xs font-medium transition-all ${percentage === pct
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50 active:bg-slate-600/50'
                }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Leverage Slider */}
      <div id="leverage-slider" className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">
          Leverage: {leverage}x
          {!leverageUnlocked && (
            <span className="ml-2 text-xs text-orange-400">
              (Unlocks at ${LEVERAGE_UNLOCK_THRESHOLD.toLocaleString()})
            </span>
          )}
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={leverage}
          onChange={(e) => setLeverage(Number(e.target.value))}
          disabled={!leverageUnlocked}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1x</span>
          <span>10x</span>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-emerald-900/20">
          <div className="text-xs text-gray-400 mb-1">Units (deal size)</div>
          <div className="text-xl font-mono font-bold text-white">
            {(positionSize / currentPrice).toFixed(3)}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-emerald-900/20">
          <div className="text-xs text-gray-400 mb-1">Amount at risk</div>
          <div className="text-xl font-mono font-bold text-white">
            ${positionSize.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div id="trade-buttons" className="grid grid-cols-2 gap-3 mb-3">
        <button
          onClick={handleLong}
          disabled={balance <= 0}
          className="py-4 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          LONG
        </button>
        <button
          onClick={handleShort}
          disabled={balance <= 0}
          className="py-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 active:bg-red-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          SHORT
        </button>
      </div>

      {/* Play/Pause + Speed Controls */}
      <div id="game-controls" className="flex gap-2">
        {/* Play/Pause Button - Half width */}
        <button
          onClick={isPlaying ? pauseGame : startGame}
          className="flex-1 py-2 bg-slate-800 text-emerald-400 font-medium rounded-lg hover:bg-slate-700 transition-all border border-emerald-900/30"
        >
          {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
        </button>

        {/* Speed Controls */}
        <div className="flex gap-1">
          {SPEED_MULTIPLIERS.map((speed) => (
            <button
              key={speed}
              onClick={() => setGameSpeed(speed)}
              className={`px-3 py-3 min-w-[44px] text-xs font-medium rounded-lg transition-all border ${currentSpeedMultiplier === speed
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-800 text-gray-400 border-emerald-900/30 hover:bg-slate-700 active:bg-slate-600'
                }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

