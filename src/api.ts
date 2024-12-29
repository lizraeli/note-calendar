import { Tables } from './supabase/types';
import { monthAndYearToDate } from './utils';
import supabase from './supabase';
import pDebounce from 'p-debounce';

export type Note = Tables<'notes'>;

export async function getCurrentUser() {
  return supabase.auth.getUser();
}

export async function getNotes() {
  const { data: notes } = await supabase.from('notes').select();
  if (notes === null) {
    return [];
  }

  return notes;
}

export async function getNotesForMonth(month: number, year: number) {
  const monthDate = monthAndYearToDate(month, year);
  const nextMonthDate = monthAndYearToDate(month + 1, year);

  const { data: notes } = await supabase
    .from('notes')
    .select()
    .gte('date', monthDate.toISOString())
    .lt('date', nextMonthDate.toISOString());

  if (notes === null) {
    return [];
  }

  return notes;
}

export async function getNoteByDate(date: Date): Promise<Note | null> {
  const { data: notes, error } = await supabase
    .from('notes')
    .select()
    .eq('date', date.toISOString());

  if (error !== null) {
    throw error;
  }

  if (notes === null) {
    return null;
  }

  return notes[0] ?? null;
}

export async function addNote(date: Date): Promise<Note | null> {
  const { data: notes, error } = await supabase
    .from('notes')
    .insert({ date: date.toISOString(), content: '' })
    .select();

  if (error !== null) {
    throw error;
  }

  if (notes === null) {
    return null;
  }

  return notes[0] ?? null;
}

export async function updateNote(
  note: Note,
  content: string
): Promise<Note[] | null> {
  const { error, data: updatedNote } = await supabase
    .from('notes')
    .update({ content })
    .eq('id', note.id)
    .select();

  if (error) {
    console.error('error updating note: ', error);
  }

  return updatedNote;
}

/**
 * Calls updateNote no more than once every 3 seconds
 */
export const debouncedUpdateNote = pDebounce(updateNote, 3000);
