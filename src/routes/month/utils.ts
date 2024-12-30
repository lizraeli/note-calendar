import { addMonths, subMonths } from 'date-fns';

export function getMonthUrls({ daysInMonth }: { daysInMonth: Date[] }) {
  const firstDay = daysInMonth[0];
  const prevMonth = subMonths(firstDay, 1);
  const prevMonthUrl = `/year/${prevMonth.getFullYear()}/month/${
    prevMonth.getMonth() + 1
  }`;

  const nextMonth = addMonths(firstDay, 1);
  const nextMonthUrl = `/year/${nextMonth.getFullYear()}/month/${
    nextMonth.getMonth() + 1
  }`;

  const date = new Date();
  const todayUrl = `/year/${date.getFullYear()}/month/${
    date.getMonth() + 1
  }/day/${date.getDate()}`;

  return { todayUrl, prevMonthUrl, nextMonthUrl };
}
