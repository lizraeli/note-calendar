import { useEffect, useState } from 'react';
import { getNotesForMonth } from './api';

type NotesCalendar = Record<string, string>;

export function useNotesForMonth(month?: string, year?: string) {
  // const [notes, setNotes] = useState<Note[] | null>(null);
  const [notesCalendar, setNotesCalendar] = useState<NotesCalendar | null>(
    null
  );

  useEffect(() => {
    if (!month || !year) {
      return;
    }

    const doGetNotes = async () => {
      try {
        const fetchedNotes = await getNotesForMonth(month, year);

        const calendar: NotesCalendar = {};
        for (const note of fetchedNotes) {
          calendar[note.date] = note.content;
        }

        setNotesCalendar(calendar);
      } catch {
        console.log('error fetching notes');
      }
    };

    doGetNotes();
  }, [month, year]);

  return notesCalendar;
}
