import DOMPurify from 'dompurify';
import './App.css';
import { useMemo } from 'react';
import { dateFormatterShort } from './utils';

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
