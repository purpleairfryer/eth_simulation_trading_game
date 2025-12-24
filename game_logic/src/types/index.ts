// Core game types
export interface Position {
  id: string;                    // Format: "0001", "0002", etc.
  asset: 'ETH';
  direction: 'long' | 'short';
  leverage: number;              // 1-10
  entryPrice: number;
  entryTime: number;             // Unix timestamp
  size: number;                  // Dollar amount invested
  notionalValue: number;         // size * leverage
  liquidationPrice: number | null; // null if 1x
}

export interface MarketDataPoint {
  timestamp: number;             // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface NewsEvent {
  headline: string;
  timestamp: number;
  type: 'bullish' | 'bearish' | 'generic';
}

export interface GameState {
  // Time Management
  gameTime: number;              // Current game Unix timestamp
  isPlaying: boolean;
  gameSpeed: number;             // 1 real sec = 1 game hour (3600s)

  // Portfolio
  balance: number;               // Available cash
  positions: Position[];
  totalEquity: number;           // balance + unrealized PnL
  leverageUnlocked: boolean;     // True once totalEquity reaches threshold

  // Market Data
  currentPrice: number;
  priceHistory: MarketDataPoint[]; // Displayed on chart
  allMarketData: MarketDataPoint[]; // All years combined (2017-2025)

  // News
  newsHistory: NewsEvent[];
  activeNews: NewsEvent | null;  // Currently displayed toast

  // UI State
  isLoading: boolean;
  error: string | null;
  isGameOver: boolean;
  gameOverReason: 'bankrupt' | 'completed' | null;
}

export interface PnLResult {
  dollarPnL: number;
  percentPnL: number;
}

