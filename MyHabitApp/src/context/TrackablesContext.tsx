import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { create, getById, update, remove, getTrackablesByType as getTrackablesByTypeDb } from '../services/database';
import type { Trackable, TrackableContextType, TrackableType } from '../types/trackable';

const TrackablesContext = createContext<TrackableContextType | null>(null);

export const useTrackables = () => {
  const context = useContext(TrackablesContext);
  if (!context) {
    throw new Error('useTrackables must be used within a TrackablesProvider');
  }
  return context;
};

export const TrackablesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trackables, setTrackables] = useState<Trackable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshTrackables = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get all trackables (we'll get them by each type and combine)
      const types: TrackableType[] = ['boolean', 'numeric', 'selection', 'text'];
      const allTrackables = await Promise.all(
        types.map(type => getTrackablesByTypeDb(type))
      );
      setTrackables(allTrackables.flat());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch trackables'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTrackable = useCallback(async (data: Omit<Trackable, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const id = await create('Trackables', data);
      const newTrackable = await getById('Trackables', id) as Trackable;
      setTrackables(prev => [...prev, newTrackable]);
      return id;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create trackable');
    }
  }, []);

  const updateTrackable = useCallback(async (
    id: number,
    data: Partial<Omit<Trackable, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      const success = await update('Trackables', id, data);
      if (success) {
        const updatedTrackable = await getById('Trackables', id) as Trackable;
        setTrackables(prev => 
          prev.map(t => t.id === id ? updatedTrackable : t)
        );
      }
      return success;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update trackable');
    }
  }, []);

  const deleteTrackable = useCallback(async (id: number) => {
    try {
      const success = await remove('Trackables', id);
      if (success) {
        setTrackables(prev => prev.filter(t => t.id !== id));
      }
      return success;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete trackable');
    }
  }, []);

  const getTrackableById = useCallback(async (id: number) => {
    try {
      const trackable = await getById('Trackables', id) as Trackable | null;
      return trackable;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to get trackable');
    }
  }, []);

  const getTrackablesByType = useCallback(async (type: TrackableType) => {
    try {
      const typeTrackables = await getTrackablesByTypeDb(type) as Trackable[];
      return typeTrackables;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to get trackables by type');
    }
  }, []);

  // Load trackables on mount
  useEffect(() => {
    refreshTrackables();
  }, [refreshTrackables]);

  const value = useMemo(() => ({
    trackables,
    isLoading,
    error,
    createTrackable,
    updateTrackable,
    deleteTrackable,
    getTrackableById,
    getTrackablesByType,
    refreshTrackables,
  }), [
    trackables,
    isLoading,
    error,
    createTrackable,
    updateTrackable,
    deleteTrackable,
    getTrackableById,
    getTrackablesByType,
    refreshTrackables,
  ]);

  return (
    <TrackablesContext.Provider value={value}>
      {children}
    </TrackablesContext.Provider>
  );
}; 