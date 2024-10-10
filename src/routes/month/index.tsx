import { useRef } from 'react';
import DailyNotesPreview from '../../components/NotesPreview';
import { format } from 'date-fns/format';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { addMonths, isToday, subMonths } from 'date-fns';
import { useNotesForMonth } from '../../hooks';
import { getDaysInMonth } from '../../utils';
import Spinner from '../../components/Spinner';
import LeftArrowIcon from '../../assets/arrow-left.svg?react';
import RightArrowIcon from '../../assets/arrow-right.svg?react';
import styles from './styles.module.css';

function monthAndYearDisplay(date: Date) {
  const monthName = date.toLocaleString('default', { month: 'long' });
  return `${monthName}, ${date.getFullYear()}`;
}

function dateToString(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

const daysOfTheWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function MonthView() {
  const { year: yearParam, month: monthParam } = useParams();

  const todayElemRef = useRef<HTMLDivElement>(null);
  const notesCalendar = useNotesForMonth(monthParam, yearParam);

  const navigate = useNavigate();

  const content = () => {
    const month = Number(monthParam);
    const year = Number(yearParam);

    if (!notesCalendar || Number.isNaN(year) || Number.isNaN(month)) {
      return <Spinner />;
    }

    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = daysInMonth[0];

    const dayOfWeeks = firstDay.getDay();

    const daysAndEmptySpaces = [
      ...Array.from({ length: dayOfWeeks }, () => null),
      ...daysInMonth,
    ];

    const prevMonth = subMonths(firstDay, 1);
    const prevMonthUrl = `/year/${prevMonth.getFullYear()}/month/${
      prevMonth.getMonth() + 1
    }`;

    const nextMonth = addMonths(firstDay, 1);
    const nextMonthUrl = `/year/${nextMonth.getFullYear()}/month/${
      nextMonth.getMonth() + 1
    }`;

    return (
      <div className={styles['calendar']}>
        <div className={styles['container']}>
          <div className={styles['month']}>
            <div className={styles['month-controls']}>
              <Link to={prevMonthUrl}>
                <LeftArrowIcon />
              </Link>
              <div className={styles['month-name']}>
                {monthAndYearDisplay(firstDay)}
              </div>
              <Link to={nextMonthUrl}>
                <RightArrowIcon />
              </Link>
            </div>
            <div className={styles['days-in-month-container']}>
              <div className={styles['days-in-month']}>
                {daysOfTheWeek.map((dayName) => (
                  <div key={dayName} className={styles['day-name-cell']}>
                    {dayName}
                  </div>
                ))}

                {daysAndEmptySpaces.map((day, index) => {
                  if (day === null) {
                    return (
                      <div key={index} className={styles['empty-cell']}></div>
                    );
                  }

                  const html = notesCalendar[dateToString(day)] || '...';
                  const isDayToday = isToday(day);
                  const className = isDayToday
                    ? styles['today-cell']
                    : styles['day-cell'];

                  return (
                    <div
                      key={day.getTime()}
                      className={className}
                      ref={isDayToday ? todayElemRef : null}
                      onClick={() => navigate(`../../day/${dateToString(day)}`)}
                    >
                      <DailyNotesPreview
                        key={day.getTime()}
                        html={html}
                        date={day}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return <>{content()}</>;
}

export default MonthView;
