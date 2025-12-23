import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

/**
 * Main game loop hook using requestAnimationFrame
 * Runs at 60fps when game is playing
 */
export const useGameLoop = () => {
  const { tick, isPlaying, gameSpeed } = useGameStore();
  const lastTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(isPlaying);

  // Keep ref in sync with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    // Cancel any existing loop
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (!isPlaying) {
      lastTimeRef.current = 0;
      return;
    }

    const loop = (currentTime: number) => {
      // Check current state via ref (always fresh)
      if (!isPlayingRef.current) {
        rafIdRef.current = null;
        return;
      }

      // Calculate delta time in seconds
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Use gameSpeed from store (configurable via GAME_SPEED constant)
      // Cap delta to prevent huge jumps
      const cappedDelta = Math.min(deltaTime, 0.1); // Max 100ms delta
      const gameTimeDelta = cappedDelta * gameSpeed;
      tick(gameTimeDelta);

      rafIdRef.current = requestAnimationFrame(loop);
    };

    // Start the loop
    lastTimeRef.current = performance.now();
    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lastTimeRef.current = 0;
    };
  }, [isPlaying, tick]);
};

