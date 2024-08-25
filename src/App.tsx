import './App.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from './Spinner';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    navigate(`/year/${year}/month/${month}`);
  }, [navigate]);

  return <Spinner />;
}

export default App;
