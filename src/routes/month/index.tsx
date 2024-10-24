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
    <div className={styles.calendar}>
      <div className={styles.container}>
        <div className={styles.month}>
          <div className={styles.monthControls}>
            <Link to={prevMonthUrl} unstable_viewTransition>
              <LeftArrowIcon />
            </Link>
            <div className={styles.monthName}>
              {monthAndYearDisplay(firstDay)}
            </div>
            <Link to={nextMonthUrl} unstable_viewTransition>
              <RightArrowIcon />
            </Link>
          </div>
          <div
            className={styles.daysInMonthContainer}
            style={{
              viewTransitionName: isTransitioningToPrevMonth
                ? 'prev-month'
                : isTransitioningToNextMonth
                ? 'next-month'
                : '',
            }}
          >
            <div className={styles.daysInMonth}>
              {daysOfTheWeek.map((dayName) => (
                <div key={dayName} className={styles['dayNameCell']}>
                  {dayName}
                </div>
              ))}

              {daysAndEmptySpaces.map((date, index) => {
                if (date === null) {
                  return (
                    <div key={index} className={styles['emptyCell']}></div>
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
    ? styles['loadingCell']
    : isSelected
    ? styles['selectedDayCell']
    : isDayToday
    ? styles['todayCell']
    : styles['dayCell'];

  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();
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
          [styles.dayCell]: true,
          [styles.selected]: isSelected,
          [styles.left]: dayOfWeek >= 3,
          [styles.right]: dayOfWeek < 3,
          [styles.up]: true,
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
