import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TUTORIAL_COMPLETED_KEY = 'crypto-sim-tutorial-completed';

export const TutorialGuide = () => {
    const [showHelpButton, setShowHelpButton] = useState(false);

    const startTour = () => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            overlayColor: 'rgba(0, 0, 0, 0.75)',
            stagePadding: 8,
            popoverClass: 'tutorial-popover',
            steps: [
                {
                    element: '#chart-panel',
                    popover: {
                        title: '📈 Price Chart',
                        description: 'This shows real ETH/USD historical price data from 2017-2025. The green line tracks the price over time, and the glowing dot shows the current price.',
                        side: 'bottom',
                        align: 'center'
                    }
                },
                {
                    element: '#position-size',
                    popover: {
                        title: '💰 Position Size',
                        description: 'Choose what percentage of your balance to invest in each trade. Start small (10-25%) to manage risk!',
                        side: 'left',
                        align: 'start'
                    }
                },
                {
                    element: '#leverage-slider',
                    popover: {
                        title: '⚡ Leverage',
                        description: 'Multiply your gains (and losses!) with leverage up to 10x. Higher leverage = higher risk of liquidation. Unlocks as you grow your portfolio.',
                        side: 'left',
                        align: 'start'
                    }
                },
                {
                    element: '#trade-buttons',
                    popover: {
                        title: '🎯 Open Trades',
                        description: 'LONG = bet price goes UP. SHORT = bet price goes DOWN. Your P&L depends on price movement after entry.',
                        side: 'left',
                        align: 'start'
                    }
                },
                {
                    element: '#game-controls',
                    popover: {
                        title: '⏱️ Time Controls',
                        description: 'PLAY starts the simulation. Speed buttons control time: 1x = 1 real second = 1 game hour. Use 100x for fast-forward!',
                        side: 'top',
                        align: 'center'
                    }
                },
                {
                    element: '#positions-table',
                    popover: {
                        title: '📊 Your Positions',
                        description: 'All your open trades appear here with entry price, current P&L, and liquidation price. Click "Close" to exit a trade.',
                        side: 'top',
                        align: 'center'
                    }
                }
            ],
            onDestroyed: () => {
                localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
                setShowHelpButton(true);
            }
        });

        driverObj.drive();
    };

    useEffect(() => {
        // Check if user has completed tutorial
        const hasCompleted = localStorage.getItem(TUTORIAL_COMPLETED_KEY);

        if (!hasCompleted) {
            // Wait for components to mount
            const timer = setTimeout(() => {
                startTour();
            }, 1500);
            return () => clearTimeout(timer);
        } else {
            setShowHelpButton(true);
        }
    }, []);

    return (
        <>
            {showHelpButton && (
                <button
                    onClick={startTour}
                    className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center text-xl transition-all hover:scale-110"
                    title="Show Tutorial"
                >
                    ?
                </button>
            )}
        </>
    );
};
