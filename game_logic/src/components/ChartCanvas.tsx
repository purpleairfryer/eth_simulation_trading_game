import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatGameTime } from '../utils/timeUtils';

const DAYS_TO_SHOW = 7; // Show 7 days of data
const CANDLES_PER_DAY = 24 * 4; // 15min candles = 96 per day
const CANDLES_TO_SHOW = DAYS_TO_SHOW * CANDLES_PER_DAY; // 672 candles for 7 days

export const ChartCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { priceHistory, currentPrice, gameTime, allMarketData } = useGameStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with device pixel ratio for crisp rendering
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Dark gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0a1f1a');
    bgGradient.addColorStop(1, '#0d2818');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    if (allMarketData.length < 2) {
      // Show loading message
      ctx.fillStyle = '#4ade80';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Loading market data...', width / 2, height / 2);
      return;
    }

    // Find current candle index in the data
    const currentCandleIdx = allMarketData.findIndex(
      (candle) => candle.timestamp >= gameTime
    );

    if (currentCandleIdx < 0) return;

    // Calculate the slice: current point at the middle (horizontally)
    const halfCandles = Math.floor(CANDLES_TO_SHOW / 2);
    const startIdx = Math.max(0, currentCandleIdx - halfCandles);
    const endIdx = Math.min(allMarketData.length, currentCandleIdx + halfCandles);

    const visibleData = allMarketData.slice(startIdx, endIdx);
    const currentPointIndex = currentCandleIdx - startIdx; // Index in visibleData

    if (visibleData.length < 2) return;

    // Calculate price range with padding
    const prices = visibleData.map(p => p.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.15;

    // Chart dimensions - responsive margins
    const isMobile = width < 500;
    const chartLeft = isMobile ? 45 : 55;
    const chartRight = width - (isMobile ? 10 : 20);
    const chartTop = 40;
    const chartBottom = height - 45;
    const chartWidth = chartRight - chartLeft;
    const chartHeight = chartBottom - chartTop;

    // Calculate center point X position (always in the middle of chart)
    const centerX = chartLeft + chartWidth / 2;

    // Pixels per candle - based on total display range
    const pixelsPerCandle = chartWidth / CANDLES_TO_SHOW;

    // Scale functions - position relative to the current point which is always centered
    const scaleX = (index: number) => {
      // Calculate offset from current point (can be negative for data before current)
      const offsetFromCurrent = index - currentPointIndex;
      return centerX + (offsetFromCurrent * pixelsPerCandle);
    };

    const scaleY = (price: number) => {
      return chartBottom - ((price - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;
    };

    // Draw subtle grid lines
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.08)';
    ctx.lineWidth = 1;

    // Horizontal grid lines - fewer labels on mobile
    const yLabels = height < 400 ? 3 : 5;
    for (let i = 0; i <= yLabels; i++) {
      const price = minPrice + (priceRange / yLabels) * i;
      const y = scaleY(price);
      ctx.beginPath();
      ctx.moveTo(chartLeft, y);
      ctx.lineTo(chartRight, y);
      ctx.stroke();
    }

    // Vertical grid lines (every day) - only up to current point
    for (let i = 0; i < visibleData.length && i <= currentPointIndex; i += CANDLES_PER_DAY) {
      const x = scaleX(i);
      if (x >= chartLeft && x <= centerX) {
        ctx.beginPath();
        ctx.moveTo(x, chartTop);
        ctx.lineTo(x, chartBottom);
        ctx.stroke();
      }
    }

    // Only draw data up to and including the current point (hide future)
    const historicalData = visibleData.slice(0, currentPointIndex + 1);

    if (historicalData.length < 1) return;

    // Draw area fill with gradient (only historical data)
    ctx.beginPath();

    // Start from the bottom-left of the first data point
    const firstX = scaleX(0);
    ctx.moveTo(Math.max(chartLeft, firstX), chartBottom);

    historicalData.forEach((candle, i) => {
      const x = scaleX(i);
      const y = scaleY(candle.close);
      // Only draw if within chart bounds
      if (x >= chartLeft) {
        ctx.lineTo(x, y);
      }
    });

    // Close the area at the current point
    const lastX = scaleX(historicalData.length - 1);
    ctx.lineTo(lastX, chartBottom);
    ctx.closePath();

    // Create area gradient
    const areaGradient = ctx.createLinearGradient(0, chartTop, 0, chartBottom);
    areaGradient.addColorStop(0, 'rgba(34, 197, 94, 0.25)');
    areaGradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.1)');
    areaGradient.addColorStop(1, 'rgba(34, 197, 94, 0.02)');
    ctx.fillStyle = areaGradient;
    ctx.fill();

    // Draw the price line (only historical data)
    ctx.beginPath();
    let lineStarted = false;
    historicalData.forEach((candle, i) => {
      const x = scaleX(i);
      const y = scaleY(candle.close);
      // Only draw if within chart bounds
      if (x >= chartLeft) {
        if (!lineStarted) {
          ctx.moveTo(x, y);
          lineStarted = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
    });

    // Line styling
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Draw current price point with glow effect
    if (currentPointIndex >= 0 && currentPointIndex < visibleData.length) {
      const currentX = scaleX(currentPointIndex);
      const currentY = scaleY(currentPrice);

      // Large glowing backdrop
      const glowGradient = ctx.createRadialGradient(
        currentX, currentY, 0,
        currentX, currentY, 80
      );
      glowGradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
      glowGradient.addColorStop(0.3, 'rgba(34, 197, 94, 0.15)');
      glowGradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(currentX, currentY, 80, 0, Math.PI * 2);
      ctx.fill();

      // Medium glow ring
      ctx.beginPath();
      ctx.arc(currentX, currentY, 20, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.fill();

      // Inner bright dot
      ctx.beginPath();
      ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#4ade80';
      ctx.fill();

      // White center
      ctx.beginPath();
      ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Draw price tooltip above the current point
      const tooltipWidth = 130;
      const tooltipHeight = 45;
      const tooltipX = currentX - tooltipWidth / 2;
      const tooltipY = currentY - tooltipHeight - 30;

      // Tooltip background with rounded corners
      ctx.beginPath();
      ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 8);
      ctx.fillStyle = 'rgba(15, 35, 30, 0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Arrow pointing down
      ctx.beginPath();
      ctx.moveTo(currentX - 8, tooltipY + tooltipHeight);
      ctx.lineTo(currentX, tooltipY + tooltipHeight + 10);
      ctx.lineTo(currentX + 8, tooltipY + tooltipHeight);
      ctx.closePath();
      ctx.fillStyle = 'rgba(15, 35, 30, 0.95)';
      ctx.fill();

      // Up arrow indicator
      ctx.fillStyle = '#4ade80';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('↑', tooltipX + 18, tooltipY + 20);

      // Price text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, tooltipX + 28, tooltipY + 20);

      // Label
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('Total', tooltipX + 28, tooltipY + 36);
    }

    // Draw Y-axis labels (price) - smaller font on mobile
    ctx.fillStyle = '#6b7280';
    ctx.font = `${isMobile ? '9px' : '11px'} Inter, sans-serif`;
    ctx.textAlign = 'right';

    for (let i = 0; i <= yLabels; i++) {
      const price = minPrice + (priceRange / yLabels) * i;
      const y = scaleY(price);

      // Format large numbers with 'k' suffix
      let priceLabel: string;
      if (price >= 1000) {
        priceLabel = `${(price / 1000).toFixed(1)}k`;
      } else {
        priceLabel = `$${price.toFixed(0)}`;
      }
      ctx.fillText(priceLabel, chartLeft - 8, y + 4);
    }

    // Draw X-axis time labels (days/months)
    ctx.textAlign = 'center';

    // Show approximately 7 labels
    const labelInterval = Math.floor(visibleData.length / 7);
    for (let i = 0; i < visibleData.length; i += labelInterval) {
      const candle = visibleData[i];
      if (candle) {
        const x = scaleX(i);
        const date = new Date(candle.timestamp * 1000);
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        ctx.fillText(label, x, chartBottom + 20);
      }
    }

  }, [priceHistory, currentPrice, gameTime, allMarketData]);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-lg p-4 shadow-xl border border-emerald-900/30 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-emerald-400">ETH/USD</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">7 Day</span>
          <div className="text-sm text-gray-400">
            {formatGameTime(gameTime)}
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full flex-1 min-h-0"
      />
    </div>
  );
};
