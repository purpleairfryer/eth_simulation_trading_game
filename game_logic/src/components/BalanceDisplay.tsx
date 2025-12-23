import { useGameStore } from '../store/gameStore';

export const BalanceDisplay = () => {
  const { balance, totalEquity } = useGameStore();
  
  return (
    <div className="mb-4">
      <div className="bg-slate-800/50 rounded-lg p-4 border border-emerald-900/20">
        <div className="text-sm text-gray-400 mb-2">Total Equity</div>
        <div className="text-3xl font-bold text-emerald-400 mb-3">
          ${totalEquity.toFixed(2)}
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-gray-500">Available Balance</div>
            <div className="text-white font-mono">${balance.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500">In Positions</div>
            <div className="text-white font-mono">${(totalEquity - balance).toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

