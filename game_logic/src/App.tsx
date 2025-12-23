import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { useGameLoop } from './hooks/useGameLoop';
import { ChartCanvas } from './components/ChartCanvas';
import { TradingPanel } from './components/TradingPanel';
import { PositionsTable } from './components/PositionsTable';
import { AdContainer } from './components/AdContainer';
import { NewsTickerToast } from './components/NewsTickerToast';
import { TutorialGuide } from './components/TutorialGuide';

function App() {
  const { initializeGame, isLoading, error } = useGameStore();

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Start game loop
  useGameLoop();

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-emerald-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📈</div>
          <div className="text-emerald-400 text-xl font-bold mb-2">
            Loading Historical Data...
          </div>
          <div className="text-gray-400 text-sm">
            Initializing crypto trading simulator
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-emerald-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-red-400 text-xl font-bold mb-2">
            Error Loading Data
          </div>
          <div className="text-gray-400 text-sm">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-emerald-950 to-slate-900 p-2 lg:p-4 overflow-auto lg:overflow-hidden">
      <div className="min-h-full lg:h-full flex flex-col lg:grid gap-3 lg:gap-4" style={{ gridTemplateRows: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
        {/* Top Row: Chart + Trading Panel */}
        <div className="flex flex-col lg:grid gap-3 lg:gap-4 lg:min-h-0" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <div className="min-h-[300px] lg:min-h-0 lg:overflow-hidden">
            <ChartCanvas />
          </div>
          <div className="lg:min-h-0 lg:overflow-hidden">
            <TradingPanel />
          </div>
        </div>

        {/* Bottom Row: Positions Table + Ads */}
        <div className="flex flex-col lg:grid gap-3 lg:gap-4 lg:min-h-0" style={{ gridTemplateColumns: '1fr 3fr' }}>
          {/* Desktop: Ads on left */}
          <div className="hidden lg:block lg:min-h-0 lg:overflow-hidden">
            <AdContainer />
          </div>
          <div className="lg:min-h-0 overflow-x-auto">
            <PositionsTable />
          </div>
        </div>

        {/* Mobile only: Ads at bottom */}
        <div className="lg:hidden">
          <AdContainer />
        </div>
      </div>

      {/* News Toast Overlay */}
      <NewsTickerToast />

      {/* Interactive Tutorial */}
      <TutorialGuide />
    </div>
  );
}

export default App;

