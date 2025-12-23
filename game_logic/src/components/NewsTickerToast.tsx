import { useNewsEngine } from '../hooks/useNewsEngine';
import { useGameStore } from '../store/gameStore';

export const NewsTickerToast = () => {
  const { activeNews } = useNewsEngine();
  const { dismissNews } = useGameStore();
  
  if (!activeNews) return null;
  
  const getBgColor = () => {
    switch (activeNews.type) {
      case 'bullish':
        return 'from-emerald-900/95 to-emerald-800/95 border-emerald-500';
      case 'bearish':
        return 'from-red-900/95 to-red-800/95 border-red-500';
      default:
        return 'from-slate-900/95 to-slate-800/95 border-slate-500';
    }
  };
  
  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-slide-in-down">
      <div className={`bg-gradient-to-r ${getBgColor()} rounded-lg shadow-2xl border-2 p-4`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">📰</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded animate-pulse">
                BREAKING
              </span>
              <span className="text-xs text-gray-400">News Headlines</span>
            </div>
            <p className="text-white text-sm leading-relaxed">
              {activeNews.headline}
            </p>
          </div>
          <button
            onClick={dismissNews}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

