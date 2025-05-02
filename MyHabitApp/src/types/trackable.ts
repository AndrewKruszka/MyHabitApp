export type TrackableType = 'boolean' | 'numeric' | 'selection' | 'text';

export interface Trackable {
  id: number;
  name: string;
  type: TrackableType;
  options?: string; // JSON string of options
  created_at: number;
  updated_at: number;
}

export interface TrackableOptions {
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export interface TrackableContextType {
  trackables: Trackable[];
  isLoading: boolean;
  error: Error | null;
  createTrackable: (data: Omit<Trackable, 'id' | 'created_at' | 'updated_at'>) => Promise<number>;
  updateTrackable: (id: number, data: Partial<Omit<Trackable, 'id' | 'created_at' | 'updated_at'>>) => Promise<boolean>;
  deleteTrackable: (id: number) => Promise<boolean>;
  getTrackableById: (id: number) => Promise<Trackable | null>;
  getTrackablesByType: (type: TrackableType) => Promise<Trackable[]>;
  refreshTrackables: () => Promise<void>;
} 