import { useParams } from 'react-router-dom';

export function useDayParams() {
  const { year: yearParam, month: monthParam, day: dayParam } = useParams();
  const year = Number(yearParam);
  const month = Number(monthParam);
  const day = Number(dayParam);

  return { year, month, day };
}
