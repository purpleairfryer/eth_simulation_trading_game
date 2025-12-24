# Historical Crypto Trading Simulator

A React-based trading game that lets you replay historical ETH price data from August 2017 to December 2025 with realistic trading mechanics including leverage, liquidations, and weekly news events.

## Features

- **Real Historical Data**: Trade ETH/USD using actual 15-minute candle data
- **Time Acceleration**: 1 real second = 1 game hour (adjustable: 1x, 2x, 5x, 100x)
- **Leverage Trading**: Unlock up to 10x leverage as you grow your portfolio
- **Realistic Liquidations**: Isolated margin with automatic position closure
- **News Engine**: Weekly market recap headlines based on price movements
- **Interactive Tutorial**: First-time user onboarding with step-by-step guide
- **Audio Experience**: Synthwave background music and trading sound effects
- **Performance Optimized**: Canvas-based charting for smooth 60fps rendering
- **Mobile Responsive**: Fully playable on mobile and tablet devices

## Tech Stack

- React 18 + TypeScript
- Vite (Build tool)
- Zustand (State management)
- Tailwind CSS (Styling)
- HTML5 Canvas API (Chart rendering)

## Getting Started

### Installation

```bash
cd game_logic
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

## Game Mechanics

### Starting Capital
- Begin with $1,000 (the "Stimulus Check")

### Trading
- Open Long or Short positions
- Choose position size: 10%-100% of available balance
- Leverage: 1x (default) or up to 10x when unlocked

### Liquidation Rules (Isolated Margin)
- Long Liquidation Price: `Entry × (1 - 1/Leverage)`
- Short Liquidation Price: `Entry × (1 + 1/Leverage)`
- Hitting liquidation price results in total loss of position investment

### Speed Controls
- 1x: Normal speed (1 real second = 1 game hour)
- 2x, 5x, 100x: Accelerated time for rapid testing

### News System
- Triggers every Monday at 00:00 game time (starting Week 2)
- News type based on 7-day price change:
  - < -5%: Bearish headlines
  - > +5%: Bullish headlines
  - Otherwise: Generic headlines

## Project Structure

```
game_logic/
├── src/
│   ├── components/        # React components
│   │   ├── ChartCanvas.tsx
│   │   ├── TradingPanel.tsx
│   │   ├── PositionsTable.tsx
│   │   └── NewsTickerToast.tsx
│   ├── hooks/             # Custom hooks
│   │   └── useGameLoop.ts
│   ├── store/             # Zustand store
│   │   └── gameStore.ts
│   ├── utils/             # Utility functions
│   │   ├── liquidation.ts
│   │   ├── pnl.ts
│   │   ├── timeUtils.ts
│   │   └── dataLoader.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── constants.ts       # Game constants
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
└── ../data/               # Game data (served via Vite publicDir)
    ├── price/eth/output/  # Historical ETH candles (2017-2025)
    └── news/              # News headlines JSON files
```

## Data Format

### Price Data
Located in `../data/price/eth/output/YYYY.json`:
```json
[
  [timestamp, open, high, low, close],
  [1503248400, 299.1, 300.52, 295.76, 299.02],
  ...
]
```

### News Headlines
Located in `../data/news/`:
- `BullishHeadlines.json`
- `BearishHeadlines.json`
- `GenericHeadlines.json`

## Performance Notes

- Canvas rendering runs at 60fps via `requestAnimationFrame`
- All historical data (2017-2025) preloaded at startup for seamless year transitions
- Price interpolation between 15m candles for smooth animation
- Efficient P&L calculations with memoization
- Responsive Y-axis labels on mobile (fewer labels, smaller font)

## Data Sources

- **ETH Price Data**: [Ethereum Price Data (Binance API) 2017-Now](https://www.kaggle.com/datasets/novandraanugrah/ethereum-price-data-binance-api-2017now) by Novandra Anugrah on Kaggle

## Audio Credits

- **Background Music**: [Synthwave 80s Retro Background Music](https://pixabay.com/music/synthwave-synthwave-80s-retro-background-music-400483/) by [Andrii Poradovskyi](https://pixabay.com/users/lnplusmusic-47631836/) from [Pixabay](https://pixabay.com/)
- **Sound Effects**: [Cash Register Purchase](https://pixabay.com/sound-effects/cash-register-purchase-87313/) by [freesound_community](https://pixabay.com/users/freesound_community-46691455/) from [Pixabay](https://pixabay.com/)

## License

MIT
