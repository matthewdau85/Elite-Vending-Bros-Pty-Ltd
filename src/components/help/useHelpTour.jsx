import { useState, useCallback } from 'react';
import { useLocalStorage } from '../shared/useLocalStorage';

const TOUR_STORAGE_KEY = 'eliteVending_completedTours';

export const useHelpTour = (tourId) => {
  const [completedTours, setCompletedTours] = useLocalStorage(TOUR_STORAGE_KEY, []);

  const isCompleted = completedTours.includes(tourId);

  const markAsCompleted = useCallback(() => {
    if (!isCompleted) {
      setCompletedTours(prev => [...prev, tourId]);
    }
  }, [tourId, isCompleted, setCompletedTours]);

  const resetTour = useCallback(() => {
    setCompletedTours(prev => prev.filter(id => id !== tourId));
  }, [tourId, setCompletedTours]);
  
  // A function to reset all tours for testing/dev purposes
  const resetAllTours = useCallback(() => {
    setCompletedTours([]);
  }, [setCompletedTours]);

  return { isCompleted, markAsCompleted, resetTour, resetAllTours, completedTours };
};