import { format, parse } from 'date-fns';

export function dateToString(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function stringToDate(urlDate: string) {
  return parse(urlDate, 'yyyy-MM-dd', new Date());
}

export function monthAndYearToDate(month: number, year: number) {
  // Javascript counts months from 0: January - 0, February - 1, etc.
  const date = new Date(year, month - 1);
  return date;
}

export function monthYearAndDayToDate(
  month: number,
  year: number,
  day: number
) {
  // Javascript counts months from 0: January - 0, February - 1, etc.
  const date = new Date(year, month - 1, day);
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
  day: 'numeric',
});

export const dateFormatterLong = new Intl.DateTimeFormat(navigator.language, {
  weekday: 'long',
  month: '2-digit',
  day: '2-digit',
  year: '2-digit',
});

export function isElementInViewport(elem: Element) {
  const rect = elem.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
