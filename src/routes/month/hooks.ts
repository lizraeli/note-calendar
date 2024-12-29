import { useParams } from 'react-router-dom';

export function useMonthParams() {
  const { year: yearParam, month: monthParam, day: dayParam } = useParams();
  const year = Number(yearParam);
  const month = Number(monthParam);
  const day = dayParam ? Number(dayParam) : null;

  return { year, month, day };
}
