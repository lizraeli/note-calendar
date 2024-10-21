import DailyNotesPreview from '../../components/NotesPreview';
import { format } from 'date-fns/format';
import {
  useNavigate,
  useParams,
  Link,
  unstable_useViewTransitionState,
} from 'react-router-dom';
import { addMonths, isToday, subMonths } from 'date-fns';
import { useNotesForMonth } from '../../hooks';
import { getDaysInMonth } from '../../utils';
import Spinner from '../../components/Spinner';
import LeftArrowIcon from '../../assets/arrow-left.svg?react';
import RightArrowIcon from '../../assets/arrow-right.svg?react';
import styles from './styles.module.css';

function monthAndYearDisplay(date: Date) {
  const monthName = date.toLocaleString('default', { month: 'long' });
  return `${monthName} ${date.getFullYear()}`;
}

function dateToString(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

const daysOfTheWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function MonthView() {
  const { year: yearParam, month: monthParam } = useParams();
  const { notesCalendar, isFetching } = useNotesForMonth(monthParam, yearParam);

  const month = Number(monthParam);
  const year = Number(yearParam);

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

  const isTransitioningToPrevMonth =
    unstable_useViewTransitionState(prevMonthUrl);

  const isTransitioningToNextMonth =
    unstable_useViewTransitionState(nextMonthUrl);

  if (!notesCalendar || Number.isNaN(year) || Number.isNaN(month)) {
    return <Spinner fullPage />;
  }

  return (
    <div className={styles['calendar']}>
      <div className={styles['container']}>
        <div className={styles['month']}>
          <div className={styles['month-controls']}>
            <Link to={prevMonthUrl} unstable_viewTransition>
              <LeftArrowIcon />
            </Link>
            <div className={styles['month-name']}>
              {monthAndYearDisplay(firstDay)}
            </div>
            <Link to={nextMonthUrl} unstable_viewTransition>
              <RightArrowIcon />
            </Link>
          </div>
          <div
            className={styles['days-in-month-container']}
            style={{
              viewTransitionName: isTransitioningToPrevMonth
                ? 'prev-month'
                : isTransitioningToNextMonth
                ? 'next-month'
                : '',
            }}
          >
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

                const html = isFetching
                  ? ''
                  : notesCalendar[dateToString(day)] || '...';

                return (
                  <DayCell
                    key={day.toISOString()}
                    day={day}
                    isFetching={isFetching}
                    html={html}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DayCell = ({
  day,
  isFetching,
  html,
}: {
  day: Date;
  isFetching: boolean;
  html: string;
}) => {
  const navigate = useNavigate();

  const dayRoute = `../../day/${dateToString(day)}`;
  const isTransitioningToDay = unstable_useViewTransitionState(dayRoute);

  const isDayToday = isToday(day);
  const className = isFetching
    ? styles['loading-cell']
    : isDayToday
    ? styles['today-cell']
    : styles['day-cell'];

  return (
    <div
      key={day.getTime()}
      className={className}
      style={{
        viewTransitionName: isTransitioningToDay ? 'day' : '',
      }}
      onClick={() =>
        navigate(dayRoute, {
          unstable_viewTransition: true,
        })
      }
    >
      <DailyNotesPreview key={day.getTime()} html={html} date={day} />
    </div>
  );
};

export default MonthView;
