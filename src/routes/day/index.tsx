import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { addDays, subDays } from 'date-fns';
import { dateFormatterLong, dateToString, stringToDate } from '../../utils';
import Tiptap from '../../components/TextEditor';
import HomeIcon from '../../assets/home.svg?react';
import LeftArrowLargeIcon from '../../assets/arrow-prev-large.svg?react';
import RightArrowLargeIcon from '../../assets/arrow-next-large.svg?react';
import { addNote, getNoteByDate, Note, throttleUpdateNote } from '../../api';
import Spinner from '../../components/Spinner';
import './styles.css';

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
      <div className="daily-note-container">
        {prevDayUrl && (
          <div className="prev-day">
            <motion.div
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 1.4 }}
              className="motion-link"
              onTap={() => navigate(prevDayUrl)}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 10,
              }}
            >
              <LeftArrowLargeIcon title="left-arrow-large" />
            </motion.div>
          </div>
        )}

        <div className="editing-container">
          <div className="header">
            <a className="all-notes-link" onClick={() => navigate('..')}>
              <button className="home-btn">
                <HomeIcon />
              </button>
            </a>
          </div>

          <div className="daily-notes-title">
            Daily notes for {dateFormatterLong.format(parsedDate)}
          </div>

          {!note ? (
            <Spinner />
          ) : (
            <Tiptap
              html={note.content}
              setHtml={onUpdateHtml}
              isFetching={isFetchingNote}
            />
          )}
        </div>

        {nextDayUrl && (
          <div className="next-day">
            <motion.div
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 1.4 }}
              className="motion-link"
              onTap={() => navigate(nextDayUrl)}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 10,
              }}
            >
              <RightArrowLargeIcon title="right-arrow-large" />
            </motion.div>
          </div>
        )}
      </div>
    );
  };

  return <>{content()}</>;
}

export default DailyNotes;
