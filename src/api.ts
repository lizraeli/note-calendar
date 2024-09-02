import { Tables } from './supabase/types';
import { stringMonthYearToDate } from './utils';
import supabase from './supabase';
import throttle from 'throttleit';

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

export async function getNotesForMonth(month: string, year: string) {
  const monthDate = stringMonthYearToDate(month, year);
  const nextMonthDate = stringMonthYearToDate(month + 1, year);

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
  const { data: notes } = await supabase
    .from('notes')
    .select()
    .eq('date', date.toISOString());

  if (notes === null) {
    return null;
  }

  return notes[0] ?? null;
}

export async function addNote(date: Date): Promise<Note | null> {
  const { data: notes } = await supabase
    .from('notes')
    .insert({ date: date.toISOString(), content: '' })
    .select();

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
 * Calls updateNote no more than once at the end of each 3 second period
 */
export const throttleUpdateNote = throttle(updateNote, 3000);
