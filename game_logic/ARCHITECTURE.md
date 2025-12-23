# System Architecture

## Component Hierarchy

```
App.tsx (Main Layout)
├── ChartCanvas
│   ├── useGameLoop (RAF loop)
│   └── useGameStore (state)
│
├── TradingPanel
│   ├── BalanceDisplay
│   ├── Percentage Slider
│   ├── Leverage Slider
│   ├── Long/Short Buttons
│   ├── Play/Pause Controls
│   └── useGameStore (state)
│
├── PositionsTable
│   ├── Position Rows (dynamic)
│   └── useGameStore (state)
│
├── AdContainer
│   └── Static placeholder
│
└── NewsTickerToast
    ├── useNewsEngine (auto-dismiss)
    └── useGameStore (state)
```

## Data Flow

```
User Action (Click Long/Short)
    ↓
TradingPanel → gameStore.openPosition()
    ↓
Calculate position details (size, leverage, liq price)
    ↓
Update store: positions[], balance
    ↓
Re-render: TradingPanel, PositionsTable
```

## Game Loop Flow

```
requestAnimationFrame (60fps)
    ↓
Calculate deltaTime
    ↓
gameStore.tick(gameTimeDelta)
    ↓
├── Interpolate current price
├── Check liquidations
├── Check Monday news trigger
├── Update total equity
└── Load next year if needed
    ↓
Update store state
    ↓
Re-render: ChartCanvas, PositionsTable
```

## State Management (Zustand)

```
gameStore
├── Time State
│   ├── gameTime (Unix timestamp)
│   ├── isPlaying (boolean)
│   └── gameSpeed (3600)
│
├── Portfolio State
│   ├── balance (available cash)
│   ├── positions[] (open trades)
│   └── totalEquity (balance + unrealized P&L)
│
├── Market State
│   ├── currentPrice (interpolated)
│   ├── priceHistory[] (visible candles)
│   ├── currentYearData[] (loaded year)
│   └── loadedYear (2017-2025)
│
├── News State
│   ├── activeNews (current toast)
│   └── newsHistory[] (all events)
│
└── Actions
    ├── startGame()
    ├── pauseGame()
    ├── openPosition()
    ├── closePosition()
    ├── tick()
    └── triggerMondayNews()
```

## File Dependencies

```
App.tsx
├── imports: ChartCanvas, TradingPanel, PositionsTable, AdContainer, NewsTickerToast
├── imports: useGameStore, useGameLoop
└── calls: initializeGame() on mount

ChartCanvas.tsx
├── imports: useGameStore
├── imports: formatGameTime (utils)
├── uses: priceHistory, currentPrice, gameTime
└── renders: Canvas with price chart

TradingPanel.tsx
├── imports: useGameStore
├── imports: POSITION_PERCENTAGES, LEVERAGE_UNLOCK_THRESHOLD
├── uses: balance, totalEquity, currentPrice, isPlaying
└── calls: openPosition(), startGame(), pauseGame()

PositionsTable.tsx
├── imports: useGameStore
├── imports: calculatePnL (utils)
├── uses: positions, currentPrice
└── calls: closePosition()

gameStore.ts
├── imports: all utility functions
├── imports: loadYearData, loadHeadlines
├── imports: calculateLiquidationPrice, checkLiquidationsAndUpdate
├── imports: calculateTotalEquity, calculatePnL
└── imports: time utils, constants

useGameLoop.ts
├── imports: useGameStore
├── uses: tick(), isPlaying
└── runs: requestAnimationFrame loop

useNewsEngine.ts
├── imports: useGameStore
├── uses: activeNews, dismissNews
└── runs: setTimeout for auto-dismiss
```

## Data Loading Strategy

```
Game Start
    ↓
initializeGame()
    ↓
loadYearData(2017)
    ↓
Store first 100 candles in priceHistory
    ↓
Set currentPrice from first candle
    ↓
Game ready to play
    ↓
Game Loop starts
    ↓
Interpolate price between candles
    ↓
When gameTime crosses year boundary
    ↓
loadYearData(nextYear)
    ↓
Replace currentYearData
    ↓
Continue seamlessly
```

## Canvas Rendering Pipeline

```
useEffect (triggered by priceHistory change)
    ↓
Get canvas context
    ↓
Set canvas size (with DPR scaling)
    ↓
Clear canvas
    ↓
Calculate price range (min/max)
    ↓
Draw Y-axis labels + grid lines
    ↓
Draw area chart (gradient fill)
    ↓
Draw price line (green)
    ↓
Draw vertical bars (sub-tick effect)
    ↓
Draw current price tooltip
    ↓
Draw X-axis time labels
```

## Liquidation Check Process

```
Every tick (60 times per second)
    ↓
For each open position
    ↓
Check if currentPrice <= liquidationPrice (long)
or currentPrice >= liquidationPrice (short)
    ↓
If liquidated:
    ├── Remove position from positions[]
    └── Log liquidation event
    ↓
If not liquidated:
    └── Keep position
    ↓
Return updated positions[] and balance
```

## News Engine Logic

```
Every tick
    ↓
Check if crossed Monday midnight
    ↓
If yes and gameTime > GAME_START + 7 days:
    ↓
    Get price from 7 days ago
    ↓
    Calculate % change
    ↓
    Select headline type:
    ├── < -5%: bearish
    ├── > +5%: bullish
    └── else: generic
    ↓
    Load headlines JSON
    ↓
    Pick random headline
    ↓
    Set activeNews in store
    ↓
    useNewsEngine triggers auto-dismiss timer
    ↓
    After 5 seconds: dismissNews()
```

## Position Lifecycle

```
1. OPEN
User clicks Long/Short
    ↓
openPosition(direction, percentage, leverage)
    ↓
Calculate:
    - size = balance × (percentage / 100)
    - notionalValue = size × leverage
    - liquidationPrice = entry × (1 ± 1/leverage)
    ↓
Create Position object
    ↓
Add to positions[]
    ↓
Deduct size from balance

2. ACTIVE
Every tick:
    ↓
Calculate current P&L
    ↓
Check liquidation
    ↓
Display in table (green/red)

3. CLOSE (Manual or Liquidation)
User clicks Close OR price hits liq
    ↓
Calculate final P&L
    ↓
returnAmount = size + P&L
    ↓
Add returnAmount to balance
    ↓
Remove from positions[]
```

## Performance Optimizations

1. **Canvas Rendering**
   - Direct pixel manipulation
   - No DOM reflows
   - Hardware accelerated

2. **Data Loading**
   - Lazy load years (not all at once)
   - Binary search for candle lookup
   - Limited visible history (1000 points)

3. **State Updates**
   - Zustand selective subscriptions
   - Minimal re-renders
   - Memoized calculations

4. **Game Loop**
   - Single RAF loop
   - Delta time for consistency
   - Efficient liquidation checks

## Error Handling

```
Data Loading
├── Try/catch in loadYearData()
├── Display error message in UI
└── Retry button

Game Loop
├── Skip frame if deltaTime > 1 second
├── Prevent negative balance
└── Validate position parameters

Canvas Rendering
├── Check canvas context exists
├── Handle empty priceHistory
└── Fallback to loading message
```

## Type Safety

All components use TypeScript with strict mode:
- Position interface
- MarketDataPoint interface
- NewsEvent interface
- GameState interface
- PnLResult interface

No `any` types used throughout the codebase.

## Build Output

```
npm run build
    ↓
TypeScript compilation (tsc)
    ↓
Vite bundling
    ↓
Tailwind CSS purging
    ↓
Output to dist/
    ├── index.html
    ├── assets/
    │   ├── index-[hash].js
    │   └── index-[hash].css
    └── data/ (copied from parent)
```

---

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Unidirectional data flow
- ✅ Type-safe interfaces
- ✅ Performance optimizations
- ✅ Error resilience
- ✅ Maintainable structure

