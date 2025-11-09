import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNotesForMonth } from './hooks';
import { createMockSession, createMockNote } from './test/helpers';
import { STORAGE_KEYS } from './supabase/localStorage';

describe('useNotesForMonth', () => {
  beforeEach(() => {
    localStorage.clear();
    // Set up a mock session
    const session = createMockSession();
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  });

  it('returns null initially', () => {
    const { result } = renderHook(() => useNotesForMonth(11, 2025));
    expect(result.current.notesCalendar).toBeNull();
    expect(result.current.isFetching).toBe(true);
  });

  it('fetches notes for a given month', async () => {
    const note1 = createMockNote({ 
      id: 1, 
      content: 'Note 1',
      date: '2025-11-08T05:00:00.000Z',
    });
    const note2 = createMockNote({ 
      id: 2, 
      content: 'Note 2',
      date: '2025-11-15T05:00:00.000Z',
    });
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([note1, note2]));

    const { result } = renderHook(() => useNotesForMonth(11, 2025));

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.notesCalendar).toEqual({
      '2025-11-08': 'Note 1',
      '2025-11-15': 'Note 2',
    });
  });

  it('returns empty calendar when no notes exist', async () => {
    const { result } = renderHook(() => useNotesForMonth(11, 2025));

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.notesCalendar).toEqual({});
  });

  it('filters notes by month', async () => {
    const novNote = createMockNote({ 
      id: 1, 
      content: 'November',
      date: '2025-11-15T05:00:00.000Z',
    });
    const decNote = createMockNote({ 
      id: 2, 
      content: 'December',
      date: '2025-12-15T05:00:00.000Z',
    });
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([novNote, decNote]));

    const { result } = renderHook(() => useNotesForMonth(11, 2025));

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.notesCalendar).toEqual({
      '2025-11-15': 'November',
    });
    expect(result.current.notesCalendar).not.toHaveProperty('2025-12-15');
  });

  it('does not fetch when month or year is undefined', () => {
    const { result } = renderHook(() => useNotesForMonth(undefined, undefined));
    
    expect(result.current.notesCalendar).toBeNull();
    expect(result.current.isFetching).toBe(false);
  });

  it('refetches when month or year changes', async () => {
    const note1 = createMockNote({ 
      id: 1, 
      content: 'November',
      date: '2025-11-15T05:00:00.000Z',
    });
    const note2 = createMockNote({ 
      id: 2, 
      content: 'December',
      date: '2025-12-15T05:00:00.000Z',
    });
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([note1, note2]));

    const { result, rerender } = renderHook(
      ({ month, year }) => useNotesForMonth(month, year),
      { initialProps: { month: 11, year: 2025 } }
    );

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.notesCalendar).toEqual({
      '2025-11-15': 'November',
    });

    // Change to December
    rerender({ month: 12, year: 2025 });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.notesCalendar).toEqual({
      '2025-12-15': 'December',
    });
  });
});
