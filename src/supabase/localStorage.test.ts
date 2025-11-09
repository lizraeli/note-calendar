import { describe, it, expect, beforeEach } from 'vitest';
import { getFromStorage, saveToStorage, getNextId, STORAGE_KEYS } from './localStorage';

describe('localStorage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveToStorage and getFromStorage', () => {
    it('saves and retrieves data', () => {
      const data = { id: 1, name: 'Test' };
      saveToStorage('test-key', data);
      const retrieved = getFromStorage('test-key');
      expect(retrieved).toEqual(data);
    });

    it('returns null for non-existent keys', () => {
      const result = getFromStorage('non-existent');
      expect(result).toBeNull();
    });

    it('overwrites existing data', () => {
      saveToStorage('test-key', { value: 1 });
      saveToStorage('test-key', { value: 2 });
      const result = getFromStorage('test-key');
      expect(result).toEqual({ value: 2 });
    });
  });

  describe('getNextId', () => {
    it('returns 1 for first ID', () => {
      const id = getNextId(STORAGE_KEYS.NOTES);
      expect(id).toBe(1);
    });

    it('increments ID for each call', () => {
      const id1 = getNextId(STORAGE_KEYS.NOTES);
      const id2 = getNextId(STORAGE_KEYS.NOTES);
      const id3 = getNextId(STORAGE_KEYS.NOTES);
      expect(id1).toBe(1);
      expect(id2).toBe(2);
      expect(id3).toBe(3);
    });

    it('maintains separate counters for different keys', () => {
      const notesId = getNextId(STORAGE_KEYS.NOTES);
      const userId = getNextId(STORAGE_KEYS.USER_ID_COUNTER);
      expect(notesId).toBe(1);
      expect(userId).toBe(1);
    });
  });
});
