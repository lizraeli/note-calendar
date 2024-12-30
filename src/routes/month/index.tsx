import DailyNotesPreview from '../../components/NotesPreview';
import {
  useNavigate,
  Link,
  unstable_useViewTransitionState,
} from 'react-router-dom';
import { isSameDay, isToday } from 'date-fns';
import { NotesCalendar, useNotesForMonth } from '../../hooks';
import { dateToString, getDaysInMonth } from '../../utils';
import Spinner from '../../components/Spinner';
import LeftArrowIcon from '../../assets/arrow-left.svg';
import RightArrowIcon from '../../assets/arrow-right.svg';
import styles from './styles.module.css';
import classNames from 'classnames';
import { useEffect, useMemo, useRef } from 'react';
import { useMonthParams } from './hooks';
import { getMonthUrls } from './utils';

function displayMonthAndYear(date: Date) {
  const monthName = date.toLocaleString('default', { month: 'long' });
  return `${monthName} ${date.getFullYear()}`;
}

const daysOfTheWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function MonthView() {
  const { year, month, day } = useMonthParams();
  const { notesCalendar, isFetching } = useNotesForMonth(month, year);

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = daysInMonth[0];

  const { prevMonthUrl, nextMonthUrl, todayUrl } = getMonthUrls({
    daysInMonth,
  });

  const isTransitioningToPrevMonth =
    unstable_useViewTransitionState(prevMonthUrl);

  const isTransitioningToNextMonth =
    unstable_useViewTransitionState(nextMonthUrl);

  const selectedDate = useMemo(() => {
    if (!day || Number.isNaN(day)) {
      return null;
    }

    return new Date(year, month - 1, day);
  }, [year, month, day]);

  if (Number.isNaN(year) || Number.isNaN(month)) {
    return <Spinner fullPage />;
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.container}>
        <div className={styles.month}>
          <div className={styles.header}>
            <Link to={todayUrl}>Today</Link>
          </div>
          <div className={styles.monthControls}>
            <Link to={prevMonthUrl} unstable_viewTransition>
              <LeftArrowIcon aria-label="left arrow" />
            </Link>
            <div className={styles.monthName}>
              {displayMonthAndYear(firstDay)}
            </div>
            <Link to={nextMonthUrl} unstable_viewTransition>
              <RightArrowIcon aria-label="right arrow" />
            </Link>
          </div>
          <div
            style={{
              viewTransitionName: isTransitioningToPrevMonth
                ? 'prev-month'
                : isTransitioningToNextMonth
                ? 'next-month'
                : '',
            }}
          >
            <DaysInMonth
              notesCalendar={notesCalendar}
              daysInMonth={daysInMonth}
              isFetching={isFetching}
              selectedDate={selectedDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DaysInMonth({
  daysInMonth,
  isFetching,
  notesCalendar,
  selectedDate,
}: {
  daysInMonth: Date[];
  isFetching: boolean;
  notesCalendar: NotesCalendar | null;
  selectedDate: Date | null;
}) {
  const firstDay = daysInMonth[0];
  const dayOfWeeks = firstDay.getDay();
  const daysAndEmptySpaces = [
    ...Array.from({ length: dayOfWeeks }, () => null),
    ...daysInMonth,
  ];

  const todayDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFetching || !selectedDate) {
      return;
    }

    if (isToday(selectedDate)) {
      // scroll to today's cell
      if (todayDivRef.current) {
        try {
          todayDivRef.current.scrollIntoView({ behavior: 'smooth' });
        } catch {
          todayDivRef.current.scrollIntoView();
        }
      }
    }
  }, [selectedDate, isFetching]);

  if (!notesCalendar) {
    return <Spinner fullPage />;
  }

  return (
    <div className={styles.daysInMonth}>
      {daysOfTheWeek.map((dayName) => (
        <div key={dayName} className={styles.dayNameCell}>
          {dayName}
        </div>
      ))}

      {daysAndEmptySpaces.map((date, index) => {
        if (date === null) {
          return <div key={index} className={styles.emptyCell}></div>;
        }

        const html = isFetching
          ? ''
          : notesCalendar[dateToString(date)] || '...';

        return (
          <DayCell
            key={date.toISOString()}
            divRef={isToday(date) ? todayDivRef : null}
            date={date}
            isFetching={isFetching}
            html={html}
            isSelected={!!selectedDate && isSameDay(date, selectedDate)}
          />
        );
      })}
    </div>
  );
}

function getDayRoutes(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const selectRoute = `/year/${year}/month/${month}/day/${day}`;
  const unselectRoute = `/year/${year}/month/${month}`;
  const editRoute = `/year/${year}/month/${month}/day/${day}/edit`;

  return {
    selectRoute,
    unselectRoute,
    editRoute,
  };
}

const DayCell = ({
  date,
  html,
  isSelected,
  divRef,
}: {
  date: Date;
  isFetching: boolean;
  html: string;
  isSelected: boolean;
  divRef: React.Ref<HTMLDivElement> | null;
}) => {
  const navigate = useNavigate();
  const { selectRoute, unselectRoute, editRoute } = useMemo(
    () => getDayRoutes(date),
    [date]
  );
  const isTransitioningToDay = unstable_useViewTransitionState(editRoute);

  const isDayToday = isToday(date);
  const dayOfWeek = date.getDay();

  const select = () => {
    if (!isSelected) {
      navigate(selectRoute);
    }
  };

  const unselect = () => {
    if (isSelected) {
      navigate(unselectRoute, { unstable_viewTransition: true });
    }
  };

  return (
    <div ref={divRef}>
      <div
        className={classNames(styles.dayCell, styles.up, {
          [styles.today]: isDayToday,
          [styles.selected]: isSelected,
          [styles.left]: dayOfWeek === 6,
          [styles.straight]: dayOfWeek >= 1 && dayOfWeek <= 5,
          [styles.right]: dayOfWeek === 0,
        })}
        style={{
          viewTransitionName: isTransitioningToDay ? 'day' : '',
        }}
        onClick={select}
      >
        <DailyNotesPreview
          key={date.getTime()}
          html={html}
          date={date}
          isSelected={isSelected}
          unselect={unselect}
          editUrl={editRoute}
        />
      </div>
    </div>
  );
};

export default MonthView;
