/**
 * LocalStorage helper functions for the mock Supabase client
 */

const STORAGE_KEYS = {
  SESSION: 'mock_session',
  NOTES: 'mock_notes',
  NOTE_ID_COUNTER: 'mock_note_id_counter',
  USER_ID_COUNTER: 'mock_user_id_counter',
} as const;

export { STORAGE_KEYS };

/**
 * Get data from localStorage with type safety
 */
export function getFromStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Save data to localStorage with type safety
 */
export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

/**
 * Remove data from localStorage
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
  }
}

/**
 * Get next ID for auto-incrementing fields
 */
export function getNextId(counterKey: string): number {
  const currentId = getFromStorage<number>(counterKey) || 0;
  const nextId = currentId + 1;
  saveToStorage(counterKey, nextId);
  return nextId;
}
