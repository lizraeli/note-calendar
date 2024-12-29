import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import DailyNotes from './routes/day';
import MonthView from './routes/month';
import { AuthenticatedRoute } from './AuthenticatedRoute';
import './styles.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthenticatedRoute component={App} />,
  },
  {
    path: '/year/:year/month/:month/day/:day/edit',
    element: <AuthenticatedRoute component={DailyNotes} />,
  },
  {
    path: '/year/:year/month/:month/day?/:day?',
    element: <AuthenticatedRoute component={MonthView} />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);
