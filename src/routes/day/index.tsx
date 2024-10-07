import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addDays, subDays } from 'date-fns';
import { dateFormatterLong, dateToString, stringToDate } from '../../utils';
import TextEditor from '../../components/TextEditor';
import HomeIcon from '../../assets/home.svg?react';
import LeftArrowIcon from '../../assets/arrow-left.svg?react';
import RightArrowIcon from '../../assets/arrow-right.svg?react';
import { addNote, getNoteByDate, Note, throttleUpdateNote } from '../../api';
import Spinner from '../../components/Spinner';
import styles from './styles.module.css';

function DailyNotes() {
  const navigate = useNavigate();
  const { date: urlDate } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [isFetchingNote, setIsFetchingNote] = useState(false);
  const parsedDate = useMemo(
    () => (urlDate ? stringToDate(urlDate) : null),
    [urlDate]
  );

  const prevDay = parsedDate && subDays(parsedDate, 1);
  const prevDayUrl = prevDay && `/day/${dateToString(prevDay)}`;
  const nextDay = parsedDate && addDays(parsedDate, 1);
  const nextDayUrl = nextDay && `/day/${dateToString(nextDay)}`;

  useEffect(() => {
    if (!parsedDate) {
      return;
    }

    const doFetchNote = async () => {
      setIsFetchingNote(true);
      const fetchedNote = await getNoteByDate(parsedDate);

      if (fetchedNote) {
        setNote(fetchedNote);
      } else {
        const addedNodeDoc = await addNote(parsedDate);
        setNote(addedNodeDoc);
      }
      setIsFetchingNote(false);
    };

    doFetchNote();
  }, [urlDate, parsedDate]);

  const onUpdateHtml = (html: string) => {
    if (!note) {
      return;
    }

    const doUpdateNote = async () => {
      await throttleUpdateNote(note, html);
    };

    doUpdateNote();
  };

  const content = () => {
    if (!parsedDate) {
      return <Spinner />;
    }

    return (
      <div className={styles['daily-note-container']}>
        <div className={styles['editing-container']}>
          <div className={styles['header']}>
            <a
              className={styles['all-notes-link']}
              onClick={() => navigate('..')}
            >
              <button className="home-btn">
                <HomeIcon />
              </button>
            </a>
          </div>

          <div className={styles['daily-note-controls']}>
            {prevDayUrl && (
              <Link to={prevDayUrl}>
                <LeftArrowIcon title="right-arrow-large" />
              </Link>
            )}
            <div className={styles['daily-notes-title']}>
              Daily notes for {dateFormatterLong.format(parsedDate)}
            </div>
            {nextDayUrl && (
              <Link to={nextDayUrl}>
                <RightArrowIcon title="right-arrow-large" />
              </Link>
            )}
          </div>

          <TextEditor
            html={note ? note.content : ''}
            setHtml={onUpdateHtml}
            isFetching={isFetchingNote}
          />
        </div>
      </div>
    );
  };

  return <>{content()}</>;
}

export default DailyNotes;
