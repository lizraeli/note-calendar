import DOMPurify from 'dompurify';
import { useMemo } from 'react';
import './styles.css';
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
    <div className="notes-preview">
      <div className="date">
        {isToday && 'Today, '}
        {title}
      </div>
      <div
        className="html"
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    </div>
  );
}

export default DailyNotesPreview;
