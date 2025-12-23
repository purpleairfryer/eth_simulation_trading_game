import { Position, PnLResult } from '../types';

/**
 * Calculate P&L for a position
 * P&L = Size × Leverage × (Price Change %)
 */
export const calculatePnL = (
  position: Position,
  currentPrice: number
): PnLResult => {
  const priceChange = position.direction === 'long'
    ? currentPrice - position.entryPrice
    : position.entryPrice - currentPrice;
  
  const percentChange = priceChange / position.entryPrice;
  const dollarPnL = position.size * position.leverage * percentChange;
  const percentPnL = (dollarPnL / position.size) * 100;
  
  return { dollarPnL, percentPnL };
};

/**
 * Calculate total equity (balance + unrealized P&L)
 */
export const calculateTotalEquity = (
  balance: number,
  positions: Position[],
  currentPrice: number
): number => {
  const unrealizedPnL = positions.reduce((total, position) => {
    const { dollarPnL } = calculatePnL(position, currentPrice);
    return total + dollarPnL;
  }, 0);
  
  return balance + unrealizedPnL;
};

