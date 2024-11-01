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
import LeftArrowIcon from '../../assets/arrow-left.svg';
import RightArrowIcon from '../../assets/arrow-right.svg';
import styles from './styles.module.css';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';

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
  const calendarRef = useRef<HTMLDivElement>(null);
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

  return (
    <div className={styles.calendar}>
      <div className={styles.container}>
        <div className={styles.month}>
          <div className={styles.monthControls}>
            <Link to={prevMonthUrl} unstable_viewTransition>
              <LeftArrowIcon aria-label="left arrow" />
            </Link>
            <div className={styles.monthName}>
              {monthAndYearDisplay(firstDay)}
            </div>
            <Link to={nextMonthUrl} unstable_viewTransition>
              <RightArrowIcon aria-label="right arrow" />
            </Link>
          </div>
          <div
            className={styles.daysInMonthContainer}
            ref={calendarRef}
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
                    calendarRef={calendarRef}
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
  calendarRef,
}: {
  date: Date;
  isFetching: boolean;
  html: string;
  isSelected: boolean;
  calendarRef: React.RefObject<HTMLDivElement>;
}) => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

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
  if (isSelected) {
    console.log('selected: ', date);
    console.log('dayOfWeek: ', dayOfWeek);
  }

  let fromTop = '';
  let fromLeft = '';
  if (ref.current && calendarRef.current) {
    console.log('setting from top and left');
    const rect = ref.current.getBoundingClientRect();
    const calendarRect = calendarRef.current.getBoundingClientRect();
    console.log('rect: ', rect);
    console.log('calendarRect: ', calendarRect);
    fromTop = rect.top - calendarRect.top + 'px';
    fromLeft = rect.left - calendarRect.left + 'px';
    console.log('fromTop: ', fromTop);
  }

  const onClick = () => {
    if (!isSelected) {
      console.log('ref.current: ', ref.current);
      // if (ref.current) {
      //   console.log('setting from top and left');
      //   const rect = ref.current.getBoundingClientRect();
      //   console.log('rect: ', rect);
      //   // ref.current.style.setProperty('--from-top', rect.top + 'px');
      //   // ref.current.style.setProperty('--from-left', rect.left + 'px');
      // }
      navigate(selectRoute);
    }
  };

  return (
    <div>
      <div
        ref={ref}
        className={classNames({
          [styles.dayCell]: true,
          [styles.selected]: isSelected,
          // [styles.left]: dayOfWeek === 6,
          // [styles.straight]: dayOfWeek >= 1 && dayOfWeek <= 5,
          // [styles.right]: dayOfWeek === 0,
          // [styles.up]: true,
        })}
        style={{
          viewTransitionName: isTransitioningToDay ? 'day' : '',
          // @ts-expect-error custom css property
          '--from-top': fromTop,
          '--from-left': fromLeft,
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
