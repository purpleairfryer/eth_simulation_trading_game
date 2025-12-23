import { MarketDataPoint } from '../types';

/**
 * Load year data from JSON file
 */
export const loadYearData = async (year: number): Promise<MarketDataPoint[]> => {
  try {
    // When publicDir is '../data', files are served from root without 'data/' prefix
    const response = await fetch(`/price/eth/output/${year}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${year} data`);
    }

    const rawData: [number, number, number, number, number][] = await response.json();

    // Transform array format to object format
    return rawData.map(([timestamp, open, high, low, close]) => ({
      timestamp,
      open,
      high,
      low,
      close
    }));
  } catch (error) {
    console.error(`Error loading year ${year}:`, error);
    throw error;
  }
};

/**
 * Load all years (2017-2025) at once and combine into single array
 */
export const loadAllYearData = async (): Promise<MarketDataPoint[]> => {
  const years = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

  try {
    // Load all years in parallel
    const allYearsData = await Promise.all(
      years.map(year => loadYearData(year).catch(err => {
        console.warn(`Failed to load ${year}, skipping:`, err);
        return [] as MarketDataPoint[];
      }))
    );

    // Combine and sort by timestamp
    const combined = allYearsData.flat().sort((a, b) => a.timestamp - b.timestamp);
    console.log(`Loaded ${combined.length} total candles from ${years[0]} to ${years[years.length - 1]}`);

    return combined;
  } catch (error) {
    console.error('Error loading all year data:', error);
    throw error;
  }
};

/**
 * Load headlines from JSON file
 */
export const loadHeadlines = async (type: 'bullish' | 'bearish' | 'generic'): Promise<string[]> => {
  try {
    const fileName = type === 'bullish'
      ? 'BullishHeadlines.json'
      : type === 'bearish'
        ? 'BearishHeadlines.json'
        : 'GenericHeadlines.json';

    // When publicDir is '../data', files are served from root without 'data/' prefix
    const response = await fetch(`/news/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${type} headlines`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error loading ${type} headlines:`, error);
    return ['Market continues its trend...']; // Fallback
  }
};

/**
 * Find the nearest candle index for a given timestamp
 */
export const findNearestCandleIndex = (
  timestamp: number,
  data: MarketDataPoint[]
): number => {
  if (data.length === 0) return 0;
  if (timestamp <= data[0].timestamp) return 0;
  if (timestamp >= data[data.length - 1].timestamp) return data.length - 1;

  // Binary search
  let left = 0;
  let right = data.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (data[mid].timestamp === timestamp) {
      return mid;
    } else if (data[mid].timestamp < timestamp) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return Math.max(0, left - 1);
};

/**
 * Interpolate price between two candles
 */
export const interpolatePrice = (
  timestamp: number,
  data: MarketDataPoint[]
): number => {
  if (data.length === 0) return 0;

  const idx = findNearestCandleIndex(timestamp, data);
  const prev = data[idx];
  const next = data[idx + 1];

  if (!next || !prev) return prev?.close || 0;

  // Linear interpolation between close prices
  const ratio = (timestamp - prev.timestamp) / (next.timestamp - prev.timestamp);
  return prev.close + (next.close - prev.close) * ratio;
};

/**
 * Get price at specific timestamp (no interpolation)
 */
export const getPriceAtTime = (
  timestamp: number,
  data: MarketDataPoint[]
): number => {
  if (data.length === 0) return 0;

  const idx = findNearestCandleIndex(timestamp, data);
  return data[idx]?.close || 0;
};

