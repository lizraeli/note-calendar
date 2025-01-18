import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addDays, subDays } from 'date-fns';
import { dateFormatterLong } from '../../utils';
import TextEditor from '../../components/TextEditor';
import HomeIcon from '../../assets/home.svg';
import LeftArrowIcon from '../../assets/arrow-left.svg';
import RightArrowIcon from '../../assets/arrow-right.svg';
import { addNote, getNoteByDate, Note, debouncedUpdateNote } from '../../api';
import Spinner from '../../components/Spinner';
import styles from './styles.module.css';
import { useDayParams } from './hooks';

enum SaveState {
  IDLE = 'IDLE',
  SAVING = 'SAVING',
  SAVED = 'SAVED',
}

function getDayUrls(date: Date) {
  const prevDay = subDays(date, 1);
  const nextDay = addDays(date, 1);

  const prevDayUrl = `/year/${prevDay.getFullYear()}/month/${
    prevDay.getMonth() + 1
  }/day/${prevDay.getDate()}/edit`;
  const nextDayUrl = `/year/${nextDay.getFullYear()}/month/${
    nextDay.getMonth() + 1
  }/day/${nextDay.getDate()}/edit`;
  const monthUrl = `/year/${prevDay.getFullYear()}/month/${
    date.getMonth() + 1
  }`;

  return { prevDayUrl, nextDayUrl, monthUrl };
}

function DailyNotes() {
  const navigate = useNavigate();
  const { year, month, day } = useDayParams();
  const [note, setNote] = useState<Note | null>(null);
  const [saveState, setSaveState] = useState<SaveState>(SaveState.IDLE);
  const [isFetchingNote, setIsFetchingNote] = useState(false);
  const [fetchingError, setFetchingError] = useState<unknown>(null);

  const date = useMemo(
    () => new Date(year, month - 1, day),
    [year, month, day]
  );

  const { prevDayUrl, nextDayUrl, monthUrl } = getDayUrls(date);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setIsFetchingNote(true);

        const fetchedNote = await getNoteByDate(date);
        if (fetchedNote) {
          setNote(fetchedNote);
        } else {
          const addedNode = await addNote(date);
          setNote(addedNode);
        }
        setIsFetchingNote(false);
      } catch (err) {
        setFetchingError(err);
        setIsFetchingNote(false);
      }
    };

    fetchNote();
  }, [date]);

  const onUpdateHtml = (html: string) => {
    if (!note) {
      return;
    }

    const doUpdateNote = async () => {
      setSaveState(SaveState.SAVING);
      await debouncedUpdateNote(note, html);
      setSaveState(SaveState.SAVED);
    };

    doUpdateNote();
  };

  const content = () => {
    if (!date) {
      return <Spinner fullPage />;
    }

    return (
      <div
        className={styles.dailyNoteContainer}
        style={{ viewTransitionName: 'day' }}
      >
        <div className={styles.editorContainer}>
          <div className={styles.header}>
            <div>
              <a
                className={styles.allNotesLink}
                onClick={() =>
                  navigate(monthUrl, { unstable_viewTransition: true })
                }
              >
                <button>
                  <HomeIcon />
                </button>
              </a>
            </div>
            {saveState === SaveState.SAVING && (
              <div className={styles.saveState}>Saving...</div>
            )}

            {saveState === SaveState.SAVED && (
              <div className={styles.saveState}>All changes saved</div>
            )}
          </div>

          <div className={styles.dailyNoteControls}>
            {prevDayUrl && (
              <Link to={prevDayUrl}>
                <LeftArrowIcon title="left-arrow-large" />
              </Link>
            )}

            <div className={styles.date}>
              Notes for {dateFormatterLong.format(date)}
            </div>

            {nextDayUrl && (
              <Link to={nextDayUrl}>
                <RightArrowIcon title="right-arrow-large" />
              </Link>
            )}
          </div>

          {fetchingError ? (
            <div className={styles.errorContainer}>Error fetching note</div>
          ) : (
            <TextEditor
              html={note ? note.content : ''}
              setHtml={onUpdateHtml}
              isFetching={isFetchingNote}
            />
          )}
        </div>
      </div>
    );
  };

  return <>{content()}</>;
}

export default DailyNotes;
