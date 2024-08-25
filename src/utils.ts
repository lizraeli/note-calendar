import { format, parse } from 'date-fns';

export function dateToString(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function stringToDate(urlDate: string) {
  return parse(urlDate, 'yyyy-MM-dd', new Date());
}

export function stringMonthYearToDate(stringMonth: string, stringYear: string) {
  // Javascript counts months from 0: January - 0, February - 1, etc.
  const date = new Date(Number(stringYear), Number(stringMonth) - 1);
  return date;
}

export const getDaysInYear = (year: number): Date[][] => {
  const days: Date[][] = [];
  for (let i = 0; i < 12; i++) {
    const daysInMonth = getDaysInMonth(i, year);
    days.push(daysInMonth);
  }

  return days;
};

export function getDaysInMonth(month: number, year: number): Date[] {
  const jsMonth = month - 1;
  const date = new Date(year, jsMonth, 1);
  const days = [];
  while (date.getMonth() === jsMonth) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return days;
}

export const dateFormatterShort = new Intl.DateTimeFormat(navigator.language, {
  weekday: 'short',
  month: '2-digit',
  day: '2-digit',
});

export const dateFormatterLong = new Intl.DateTimeFormat(navigator.language, {
  weekday: 'long',
  month: '2-digit',
  day: '2-digit',
  year: '2-digit',
});
