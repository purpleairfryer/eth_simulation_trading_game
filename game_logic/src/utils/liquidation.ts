import { Position } from '../types';

/**
 * Calculate liquidation price for a position
 * Long: Entry * (1 - 1/Leverage)
 * Short: Entry * (1 + 1/Leverage)
 */
export const calculateLiquidationPrice = (
  entryPrice: number,
  direction: 'long' | 'short',
  leverage: number
): number | null => {
  if (leverage === 1) return null; // No liquidation at 1x
  
  if (direction === 'long') {
    return entryPrice * (1 - 1 / leverage);
  } else {
    return entryPrice * (1 + 1 / leverage);
  }
};

/**
 * Check if a position should be liquidated
 */
export const isLiquidated = (
  position: Position,
  currentPrice: number
): boolean => {
  if (!position.liquidationPrice) return false;
  
  if (position.direction === 'long') {
    return currentPrice <= position.liquidationPrice;
  } else {
    return currentPrice >= position.liquidationPrice;
  }
};

/**
 * Process liquidations and return updated positions and balance
 */
export const checkLiquidationsAndUpdate = (
  positions: Position[],
  currentPrice: number,
  balance: number
): { positions: Position[]; balance: number } => {
  const survivingPositions: Position[] = [];
  let updatedBalance = balance;
  
  for (const position of positions) {
    if (isLiquidated(position, currentPrice)) {
      // Position liquidated - investor loses their initial investment (size)
      // Balance was already reduced when position opened, so no change here
      console.log(`Position ${position.id} liquidated at ${currentPrice}`);
    } else {
      survivingPositions.push(position);
    }
  }
  
  return {
    positions: survivingPositions,
    balance: updatedBalance
  };
};

