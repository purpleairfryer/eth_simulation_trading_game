import { create } from 'zustand';
import { GameState, Position, NewsEvent } from '../types';
import {
  GAME_START_TIME,
  GAME_END_TIME,
  INITIAL_BALANCE,
  GAME_SPEED,
  LEVERAGE_UNLOCK_THRESHOLD
} from '../constants';
import {
  loadAllYearData,
  interpolatePrice,
  getPriceAtTime,
  loadHeadlines
} from '../utils/dataLoader';
import { checkLiquidationsAndUpdate } from '../utils/liquidation';
import { calculateTotalEquity, calculatePnL } from '../utils/pnl';
import {
  crossedMondayMidnight,
  getTimestampWeekAgo
} from '../utils/timeUtils';
import { calculateLiquidationPrice } from '../utils/liquidation';

interface GameStore extends GameState {
  // Actions
  startGame: () => void;
  pauseGame: () => void;
  resetGame: () => void;
  tick: (gameTimeDelta: number) => void;
  openPosition: (direction: 'long' | 'short', percentage: number, leverage: number) => void;
  closePosition: (id: string) => void;
  initializeGame: () => Promise<void>;
  triggerMondayNews: () => Promise<void>;
  dismissNews: () => void;
  setGameSpeed: (multiplier: number) => void;
}

let positionCounter = 0;

const generatePositionId = (): string => {
  positionCounter++;
  return positionCounter.toString().padStart(4, '0');
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameTime: GAME_START_TIME,
  isPlaying: false,
  gameSpeed: GAME_SPEED,
  balance: INITIAL_BALANCE,
  positions: [],
  totalEquity: INITIAL_BALANCE,
  leverageUnlocked: INITIAL_BALANCE >= LEVERAGE_UNLOCK_THRESHOLD,
  currentPrice: 0,
  priceHistory: [],
  allMarketData: [],
  newsHistory: [],
  activeNews: null,
  isLoading: true,
  error: null,
  isGameOver: false,
  gameOverReason: null,

  // Initialize game - load all year data at once
  initializeGame: async () => {
    set({ isLoading: true, error: null });
    try {
      const allData = await loadAllYearData();
      const startPrice = allData[0]?.close || 0;

      set({
        allMarketData: allData,
        priceHistory: allData.slice(0, 100), // Start with first 100 candles visible
        currentPrice: startPrice,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false
      });
    }
  },

  // Start/Resume game
  startGame: () => {
    set({ isPlaying: true });
  },

  // Pause game
  pauseGame: () => {
    set({ isPlaying: false });
  },

  // Reset game to initial state
  resetGame: () => {
    positionCounter = 0;
    set({
      gameTime: GAME_START_TIME,
      isPlaying: false,
      balance: INITIAL_BALANCE,
      positions: [],
      totalEquity: INITIAL_BALANCE,
      leverageUnlocked: INITIAL_BALANCE >= LEVERAGE_UNLOCK_THRESHOLD,
      newsHistory: [],
      activeNews: null,
      isGameOver: false,
      gameOverReason: null
    });
    get().initializeGame();
  },

  // Main game tick
  tick: (gameTimeDelta: number) => {
    const state = get();
    if (!state.isPlaying) return; // Double-check we're playing

    const newGameTime = state.gameTime + gameTimeDelta;

    // Get current price via interpolation (using all market data)
    const currentPrice = interpolatePrice(newGameTime, state.allMarketData);

    // Check liquidations
    const { positions, balance } = checkLiquidationsAndUpdate(
      state.positions,
      currentPrice,
      state.balance
    );

    // Calculate total equity
    const totalEquity = calculateTotalEquity(balance, positions, currentPrice);

    // Check for Monday news trigger
    if (crossedMondayMidnight(state.gameTime, newGameTime)) {
      get().triggerMondayNews();
    }

    // Update visible price history (keep last 1000 points)
    const currentCandleIdx = state.allMarketData.findIndex(
      (candle) => candle.timestamp >= newGameTime
    );
    const visibleHistory = state.allMarketData.slice(
      Math.max(0, currentCandleIdx - 500),
      currentCandleIdx + 500
    );
    // Check if leverage should be unlocked (once unlocked, stays unlocked)
    const leverageUnlocked = state.leverageUnlocked || totalEquity >= LEVERAGE_UNLOCK_THRESHOLD;

    // Check for game over conditions
    // 1. Bankrupt: totalEquity <= 0 and no positions
    if (totalEquity <= 0 && positions.length === 0) {
      set({
        isPlaying: false,
        isGameOver: true,
        gameOverReason: 'bankrupt',
        gameTime: newGameTime,
        currentPrice,
        positions,
        balance,
        totalEquity
      });
      return;
    }

    // 2. Completed: reached end of data
    if (newGameTime >= GAME_END_TIME) {
      set({
        isPlaying: false,
        isGameOver: true,
        gameOverReason: 'completed',
        gameTime: GAME_END_TIME,
        currentPrice,
        positions,
        balance,
        totalEquity
      });
      return;
    }

    set({
      gameTime: newGameTime,
      currentPrice,
      positions,
      balance,
      totalEquity,
      leverageUnlocked,
      priceHistory: visibleHistory
    });
  },

  // Open a new position
  openPosition: (direction: 'long' | 'short', percentage: number, leverage: number) => {
    const state = get();

    // Validate balance
    if (state.balance <= 0) {
      console.warn('Insufficient balance');
      return;
    }

    // Validate leverage unlock
    if (leverage > 1 && state.totalEquity < LEVERAGE_UNLOCK_THRESHOLD) {
      console.warn('Leverage locked - need $5,000 total equity');
      return;
    }

    // Calculate position size
    const size = (state.balance * percentage) / 100;
    if (size <= 0) {
      console.warn('Invalid position size');
      return;
    }

    const notionalValue = size * leverage;
    const liquidationPrice = calculateLiquidationPrice(
      state.currentPrice,
      direction,
      leverage
    );

    const newPosition: Position = {
      id: generatePositionId(),
      asset: 'ETH',
      direction,
      leverage,
      entryPrice: state.currentPrice,
      entryTime: state.gameTime,
      size,
      notionalValue,
      liquidationPrice
    };

    set({
      positions: [...state.positions, newPosition],
      balance: state.balance - size, // Deduct investment from balance
      totalEquity: calculateTotalEquity(
        state.balance - size,
        [...state.positions, newPosition],
        state.currentPrice
      )
    });
  },

  // Close a position
  closePosition: (id: string) => {
    const state = get();
    const position = state.positions.find(p => p.id === id);

    if (!position) {
      console.warn('Position not found');
      return;
    }

    // Calculate P&L
    const { dollarPnL } = calculatePnL(position, state.currentPrice);

    // Return: initial investment + P&L
    const returnAmount = position.size + dollarPnL;
    const newBalance = state.balance + returnAmount;
    const newPositions = state.positions.filter(p => p.id !== id);

    set({
      positions: newPositions,
      balance: newBalance,
      totalEquity: calculateTotalEquity(newBalance, newPositions, state.currentPrice)
    });
  },

  // Trigger Monday news
  triggerMondayNews: async () => {
    const state = get();

    // Skip first week
    if (state.gameTime < GAME_START_TIME + (7 * 24 * 3600)) {
      return;
    }

    // Get price from 7 days ago
    const weekAgoTimestamp = getTimestampWeekAgo(state.gameTime);
    const priceWeekAgo = getPriceAtTime(weekAgoTimestamp, state.allMarketData);

    if (priceWeekAgo === 0) return; // No data

    // Calculate % change
    const percentChange = ((state.currentPrice - priceWeekAgo) / priceWeekAgo) * 100;

    // Select headline type
    let type: 'bullish' | 'bearish' | 'generic';
    if (percentChange < -5) {
      type = 'bearish';
    } else if (percentChange > 5) {
      type = 'bullish';
    } else {
      type = 'generic';
    }

    // Load and select random headline
    const headlines = await loadHeadlines(type);
    const headline = headlines[Math.floor(Math.random() * headlines.length)];

    const newsEvent: NewsEvent = {
      headline,
      timestamp: state.gameTime,
      type
    };

    set({
      activeNews: newsEvent,
      newsHistory: [...state.newsHistory, newsEvent]
    });
  },

  // Dismiss news toast
  dismissNews: () => {
    set({ activeNews: null });
  },

  // Set game speed multiplier
  setGameSpeed: (multiplier: number) => {
    set({ gameSpeed: GAME_SPEED * multiplier });
  }
}));

