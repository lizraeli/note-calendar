import './App.css';
import DailyNotesPreview from './NotesPreview';
import { format } from 'date-fns/format';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { addMonths, isToday, subMonths } from 'date-fns';
import { useNotesForMonth } from './hooks';
import { motion } from 'framer-motion';
import { getDaysInMonth } from './utils';
import Spinner from './Spinner';
import LeftArrowIcon from './assets/arrow-left.svg?react';
import LeftArrowLargeIcon from './assets/arrow-prev-large.svg?react';
import RightArrowLargeIcon from './assets/arrow-next-large.svg?react';
import RightArrowIcon from './assets/arrow-right.svg?react';
import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    if (todayElemRef.current) {
      try {
        todayElemRef.current.scrollIntoView({ behavior: 'smooth' });
      } catch {
        console.log('error scrolling to today');
      }
    }
  }, [notesCalendar]);

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
      <div className="calendar">
        <div className="title">Daily Notes</div>
        <div className="container">
          <motion.div
            key={firstDay.getTime()}
            className="month"
            drag="x"
            whileDrag={{ scale: 1.2 }}
          >
            <div className="month-controls">
              <Link to={prevMonthUrl}>
                <LeftArrowIcon />
              </Link>
              <div className="month-name">{monthAndYearDisplay(firstDay)}</div>
              <Link to={nextMonthUrl}>
                <RightArrowIcon />
              </Link>
            </div>
            <div className="days-container">
              <div className="prev-month">
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 1.4 }}
                  className="motion-link"
                  onTap={() => navigate(prevMonthUrl)}
                  transition={{
                    type: 'spring',
                    stiffness: 150,
                    damping: 10,
                  }}
                >
                  <LeftArrowLargeIcon title="left-arrow-large" />
                </motion.div>
              </div>
              <div className="days-in-month">
                {daysOfTheWeek.map((dayName) => (
                  <div key={dayName} className="cell day-name">
                    {dayName}
                  </div>
                ))}

                {daysAndEmptySpaces.map((day) => {
                  if (day === null) {
                    return <div className="cell empty"></div>;
                  }

                  const html = notesCalendar[dateToString(day)] || '...';
                  const isDayToday = isToday(day);
                  const className = isDayToday ? 'cell day today' : 'cell day';

                  return (
                    <motion.div
                      key={day.getTime()}
                      className={className}
                      ref={isDayToday ? todayElemRef : null}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 1.4 }}
                      onTap={() => navigate(`../../day/${dateToString(day)}`)}
                      transition={{
                        type: 'spring',
                        stiffness: 150,
                        damping: 10,
                      }}
                    >
                      <DailyNotesPreview
                        key={day.getTime()}
                        html={html}
                        date={day}
                        isToday={isDayToday}
                      />
                    </motion.div>
                  );
                })}
              </div>
              <div className="next-month">
                <motion.div
                  className="motion-link"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 1.4 }}
                  onTap={() => navigate(nextMonthUrl)}
                  transition={{
                    type: 'spring',
                    stiffness: 150,
                    damping: 10,
                  }}
                >
                  <RightArrowLargeIcon title="right-arrow-large" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  return <>{content()}</>;
}

export default MonthView;
