import DailyNotesPreview from '../../components/NotesPreview';
import { format } from 'date-fns/format';
import {
  useNavigate,
  useParams,
  Link,
  unstable_useViewTransitionState,
} from 'react-router-dom';
import { addMonths, isSameDay, isToday, subMonths } from 'date-fns';
import { useNotesForMonth } from '../../hooks';
import { getDaysInMonth } from '../../utils';
import Spinner from '../../components/Spinner';
import LeftArrowIcon from '../../assets/arrow-left.svg?react';
import RightArrowIcon from '../../assets/arrow-right.svg?react';
import styles from './styles.module.css';
import classNames from 'classnames';

function monthAndYearDisplay(date: Date) {
  const monthName = date.toLocaleString('default', { month: 'long' });
  return `${monthName} ${date.getFullYear()}`;
}

function dateToString(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

const daysOfTheWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function calcSelectedDate({
  year,
  month,
  dayParam,
}: {
  year: number;
  month: number;
  dayParam?: string;
}) {
  if (!dayParam) {
    return null;
  }

  const day = Number(dayParam);
  if (Number.isNaN(day)) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function MonthView() {
  const { year: yearParam, month: monthParam, day: dayParam } = useParams();
  const { notesCalendar, isFetching } = useNotesForMonth(monthParam, yearParam);
  const year = Number(yearParam);
  const month = Number(monthParam);

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

  const selectedDate = calcSelectedDate({ year, month, dayParam });

  console.log('selectedDate: ', selectedDate);
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

              {daysAndEmptySpaces.map((date, index) => {
                if (date === null) {
                  return (
                    <div key={index} className={styles['empty-cell']}></div>
                  );
                }

                const html = isFetching
                  ? ''
                  : notesCalendar[dateToString(date)] || '...';

                return (
                  <DayCell
                    key={date.toISOString()}
                    date={date}
                    isFetching={isFetching}
                    html={html}
                    isSelected={!!selectedDate && isSameDay(date, selectedDate)}
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
  date,
  isFetching,
  html,
  isSelected,
}: {
  date: Date;
  isFetching: boolean;
  html: string;
  isSelected: boolean;
}) => {
  const navigate = useNavigate();

  const selectRoute = `/year/${date.getFullYear()}/month/${
    date.getMonth() + 1
  }/day/${date.getDate()}`;
  const editRoute = `../../day/${dateToString(date)}`;
  const isTransitioningToDay = unstable_useViewTransitionState(editRoute);

  const isDayToday = isToday(date);
  const className = isFetching
    ? styles['loading-cell']
    : isSelected
    ? styles['selected-day-cell']
    : isDayToday
    ? styles['today-cell']
    : styles['day-cell'];

  if (isSelected) {
    console.log('selected: ', date);
  }

  const onClick = () => {
    if (!isSelected) {
      navigate(selectRoute);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        className={classNames({
          [styles['day-cell']]: true,
          [styles['selected']]: isSelected,
        })}
        style={{
          viewTransitionName: isTransitioningToDay ? 'day' : '',
        }}
        onClick={onClick}
      >
        <DailyNotesPreview
          key={date.getTime()}
          html={html}
          date={date}
          isSelected={isSelected}
          editUrl={editRoute}
        />
      </div>
    </div>
  );
};

// return (
//   <div className={className} onClick={onClick}>
//     <DailyNotesPreview
//       key={date.getTime()}
//       html={html}
//       date={date}
//       isSelected={isSelected}
//       editUrl={editRoute}
//     />
//   </div>
// );
// };

export default MonthView;
