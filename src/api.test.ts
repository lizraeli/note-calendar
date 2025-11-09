import { describe, it, expect, beforeEach } from 'vitest';
import { getNotes, addNote, updateNote } from './api';
import { createMockSession, createMockNote } from './test/helpers';
import { STORAGE_KEYS } from './supabase/localStorage';

describe('API functions', () => {
  beforeEach(() => {
    localStorage.clear();
    // Set up a mock session
    const session = createMockSession();
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  });

  describe('getNotes', () => {
    it('returns empty array when no notes exist', async () => {
      const notes = await getNotes();
      expect(notes).toEqual([]);
    });

    it('returns all notes', async () => {
      const note1 = createMockNote({ id: 1, content: 'Note 1' });
      const note2 = createMockNote({ id: 2, content: 'Note 2' });
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([note1, note2]));

      const notes = await getNotes();
      expect(notes).toHaveLength(2);
      expect(notes[0].content).toBe('Note 1');
      expect(notes[1].content).toBe('Note 2');
    });
  });

  describe('addNote', () => {
    it('creates a new note', async () => {
      const date = new Date('2025-11-08');
      
      const note = await addNote(date);
      
      expect(note).not.toBeNull();
      expect(note?.content).toBe('');
      expect(note?.date).toBe('2025-11-08T00:00:00.000Z');
      expect(note?.id).toBeDefined();
    });

    it('increments note ID', async () => {
      const date = new Date('2025-11-08');
      
      const note1 = await addNote(date);
      const note2 = await addNote(date);
      
      expect(note2?.id).toBeGreaterThan(note1?.id ?? 0);
    });
  });

  describe('updateNote', () => {
    it('updates an existing note', async () => {
      const note = createMockNote({ id: 1, content: 'Original' });
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([note]));

      const updated = await updateNote(note, 'Updated content');
      
      expect(updated).not.toBeNull();
      expect(updated?.[0].content).toBe('Updated content');
      expect(updated?.[0].id).toBe(1);
    });

    it('persists the update to localStorage', async () => {
      const note = createMockNote({ id: 1, content: 'Original' });
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([note]));

      await updateNote(note, 'Updated content');
      const notes = await getNotes();
      
      expect(notes[0].content).toBe('Updated content');
    });
  });
});
