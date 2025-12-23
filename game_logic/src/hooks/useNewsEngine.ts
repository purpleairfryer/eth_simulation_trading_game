import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { NEWS_DISPLAY_DURATION } from '../constants';

/**
 * Hook to manage news toast display and auto-dismiss
 */
export const useNewsEngine = () => {
  const { activeNews, dismissNews } = useGameStore();
  
  useEffect(() => {
    if (!activeNews) return;
    
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      dismissNews();
    }, NEWS_DISPLAY_DURATION);
    
    return () => clearTimeout(timer);
  }, [activeNews, dismissNews]);
  
  return { activeNews };
};

