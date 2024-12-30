import { useEffect, useState } from 'react';
import { getNotesForMonth } from './api';

type DateString = string;
export type NotesCalendar = Record<DateString, string>;

export function useNotesForMonth(month?: number, year?: number) {
  const [isFetching, setIsFetching] = useState(false);
  const [notesCalendar, setNotesCalendar] = useState<NotesCalendar | null>(
    null
  );

  useEffect(() => {
    if (!month || !year) {
      return;
    }

    const doGetNotes = async () => {
      try {
        setIsFetching(true);
        const fetchedNotes = await getNotesForMonth(month, year);

        const calendar = fetchedNotes.reduce(
          (calendar, note) => ({
            ...calendar,
            [note.date]: note.content,
          }),
          {} as NotesCalendar
        );

        setNotesCalendar(calendar);
        setIsFetching(false);
      } catch {
        console.log('error fetching notes');
      }
    };

    doGetNotes();
  }, [month, year]);

  return { notesCalendar, isFetching };
}
