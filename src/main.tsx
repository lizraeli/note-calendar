import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import DailyNotes from './routes/day';
import MonthView from './routes/month';
import { AuthenticatedRoute } from './AuthenticatedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthenticatedRoute component={App} />,
  },
  {
    path: '/day/:date',
    element: <AuthenticatedRoute component={DailyNotes} />,
  },
  {
    path: '/year/:year/month/:month',
    element: <AuthenticatedRoute component={MonthView} />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);
