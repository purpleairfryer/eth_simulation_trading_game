import { useGameStore } from '../store/gameStore';
import { calculatePnL } from '../utils/pnl';

export const PositionsTable = () => {
  const { positions, currentPrice, closePosition } = useGameStore();

  if (positions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-lg p-6 shadow-xl border border-emerald-900/30 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">No open positions</p>
          <p className="text-sm">Open a Long or Short position to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-lg p-4 shadow-xl border border-emerald-900/30 h-full flex flex-col">
      <h3 className="text-lg font-bold text-emerald-400 mb-3">Player Positions</h3>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-emerald-900/30">
              <th className="text-left py-2 px-2">Trade ID</th>
              <th className="text-left py-2 px-2">Asset</th>
              <th className="text-left py-2 px-2">Position</th>
              <th className="text-right py-2 px-2">Size</th>
              <th className="text-right py-2 px-2">Notional</th>
              <th className="text-right py-2 px-2">Entry</th>
              <th className="text-right py-2 px-2">Current</th>
              <th className="text-right py-2 px-2">Liq Price</th>
              <th className="text-right py-2 px-2">P&L ($)</th>
              <th className="text-right py-2 px-2">P&L (%)</th>
              <th className="text-center py-2 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => {
              const { dollarPnL, percentPnL } = calculatePnL(position, currentPrice);
              const isProfit = dollarPnL >= 0;

              return (
                <tr
                  key={position.id}
                  className="border-b border-emerald-900/20 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-2 font-mono text-emerald-400">{position.id}</td>
                  <td className="py-3 px-2 text-white font-medium">ETH</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-white font-medium ${position.direction === 'long' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                        {position.direction === 'long' ? 'Long' : 'Short'}
                      </span>
                      {position.leverage > 1 && (
                        <span className="px-2 py-0.5 bg-lime-500 text-slate-900 text-xs font-bold rounded-full">
                          {position.leverage}x
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-white">
                    ${position.size.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-gray-400">
                    {position.leverage > 1 ? `$${position.notionalValue.toFixed(2)}` : 'N/A'}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-white">
                    ${position.entryPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-emerald-400">
                    ${currentPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-orange-400">
                    {position.liquidationPrice
                      ? `$${position.liquidationPrice.toFixed(2)}`
                      : 'N/A'}
                  </td>
                  <td className={`py-3 px-2 text-right font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                    {isProfit ? '+' : ''}{dollarPnL.toFixed(2)}
                  </td>
                  <td className={`py-3 px-2 text-right font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                    {isProfit ? '+' : ''}{percentPnL.toFixed(2)}%
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => closePosition(position.id)}
                      className="px-4 py-2 bg-slate-700 text-white text-xs font-medium rounded hover:bg-slate-600 active:bg-slate-500 transition-colors min-w-[60px]"
                    >
                      Close
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

