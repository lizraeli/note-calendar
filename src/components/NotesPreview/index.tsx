import DOMPurify from 'dompurify';
import { useMemo } from 'react';
import styles from './styles.module.css';
import { dateFormatterShort } from '../../utils';
import { Link } from 'react-router-dom';
import EditIcon from '../../assets/edit.svg';
import classNames from 'classnames';

type Props = { html: string; date: Date; isSelected: boolean; editUrl: string };

function DailyNotesPreview({ html, date, isSelected, editUrl }: Props) {
  const sanitizedHTML = useMemo(() => DOMPurify.sanitize(html), [html]);

  const title = dateFormatterShort.format(date);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.date}>{title}</div>
        {isSelected && (
          <Link to={editUrl} unstable_viewTransition>
            <EditIcon />
          </Link>
        )}
      </div>
      <div
        className={classNames(styles.html, {
          [styles.selected]: isSelected,
        })}
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    </div>
  );
}

export default DailyNotesPreview;
