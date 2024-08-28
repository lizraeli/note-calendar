import DOMPurify from 'dompurify';
import { useMemo } from 'react';
import styles from './styles.module.css';
import { dateFormatterShort } from '../../utils';

function DailyNotesPreview({
  html,
  date,
  isToday,
}: {
  html: string;
  date: Date;
  isToday: boolean;
}) {
  const sanitizedHTML = useMemo(() => DOMPurify.sanitize(html), [html]);

  const title = dateFormatterShort.format(date);

  return (
    <div className={styles.container}>
      <div className={styles.date}>
        {isToday && 'Today, '}
        {title}
      </div>
      <div
        className={styles.html}
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    </div>
  );
}

export default DailyNotesPreview;
