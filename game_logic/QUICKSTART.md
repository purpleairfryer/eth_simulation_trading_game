# Quick Start Guide

## 🚀 Running the Game

### First Time Setup
```bash
cd game_logic
npm install
```

### Start Development Server
```bash
npm run dev
```

The game will automatically open at [http://localhost:3000](http://localhost:3000)

## 🎮 How to Play

1. **Start**: Click the "▶ PLAY" button to begin
2. **Trading**: 
   - Adjust position size slider (10-100%)
   - Select leverage (1x initially, 10x unlocks at $5,000 equity)
   - Click "LONG" if you think price will go up
   - Click "SHORT" if you think price will go down
3. **Monitor**: Watch your positions in the table below
4. **Close**: Click "Close" button on any position to realize P&L
5. **News**: Weekly news will appear every Monday based on market performance

## 🎯 Game Goals

- **Starter Goal**: Turn $1,000 into $5,000 to unlock leverage
- **Pro Goal**: Reach $10,000+ through smart trading
- **Master Goal**: Beat the full historical period without liquidation

## ⚠️ Important Rules

- **Liquidation**: If price hits your liquidation price, you lose the entire position
- **Balance**: You can only use available balance (not total equity)
- **Leverage**: Higher leverage = Higher risk/reward + Closer liquidation price

## 📊 Understanding the UI

### Top Left: Chart
- Green area shows ETH price history
- Tooltip displays current price
- Time advances automatically (1 real second = 1 game hour)

### Top Right: Trading Panel
- Shows current balance and position calculator
- Use sliders to set position size and leverage
- LONG/SHORT buttons to open positions

### Bottom Right: Positions Table
- Trade ID: Unique identifier for each position
- Leverage Badge: Shows if using 1x-10x
- P&L: Green = profit, Red = loss
- Liq Price: Price at which position auto-closes at loss

### Bottom Left: Ad Space
- Placeholder for future ad integrations

## 🐛 Troubleshooting

### "Failed to load data"
- Make sure the `data/price/eth/output/` folder contains year JSON files (2017.json - 2025.json)
- Check that the files are in the correct format: `[timestamp, open, high, low, close]`

### Game runs too fast/slow
- This is by design: 1 real second = 1 game hour
- Use PAUSE button to stop and analyze

### Leverage slider disabled
- Leverage unlocks when your total equity reaches $5,000
- Keep trading profitably to unlock it

## 🛠️ Build for Production
```bash
npm run build
```

Output will be in `game_logic/dist/` folder.

## 📝 Data Files Required

The game expects these data files in the parent directory:

```
data/
├── price/eth/output/
│   ├── 2017.json
│   ├── 2018.json
│   ├── 2019.json
│   ├── 2020.json
│   ├── 2021.json
│   ├── 2022.json
│   ├── 2023.json
│   ├── 2024.json
│   └── 2025.json
└── news/
    ├── BullishHeadlines.json
    ├── BearishHeadlines.json
    └── GenericHeadlines.json
```

## 🎨 Tech Stack

- **Framework**: React 18 + TypeScript
- **State**: Zustand (global store)
- **Styling**: Tailwind CSS
- **Build**: Vite
- **Rendering**: HTML5 Canvas (no external charting libraries)

Enjoy trading! 📈🚀

