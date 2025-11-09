import { ComponentType, useState } from 'react';
import { User } from '@supabase/supabase-js';
import useSession from '../supabase/useSession';
import supabase from '../supabase';
import Header from '../components/Header';
import styles from './styles.module.css';
import Spinner from '../components/Spinner';

type Props = {
  component: ComponentType<{ user: User }>;
};

export const AuthenticatedRoute = ({ component }: Props) => {
  const { session, isFetchingSession } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const signInAnonymously = async () => {
    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error('error signing in anonymously');
      setError('Error signing in anonymously');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError('Error signing up');
        console.error('error signing up:', error);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError('Error signing in');
        console.error('error signing in:', error);
      }
    }
  };

  if (isFetchingSession) {
    return <Spinner fullPage />;
  }

  if (!session) {
    return (
      <div className={styles.container}>
        <div className={styles.title}>Note Calendar</div>

        <div className={styles.subContainer}>
          <button onClick={signInAnonymously}>Use without signing in</button>
        </div>

        <div className={styles.subContainer}>
          <form
            onSubmit={handleEmailAuth}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              width: '300px',
            }}
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid lightgray',
                fontFamily: 'Lato, sans-serif',
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid lightgray',
                fontFamily: 'Lato, sans-serif',
              }}
            />
            {error && (
              <div style={{ color: 'red', fontSize: '14px' }}>{error}</div>
            )}
            <button
              type="submit"
              style={{
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid lightgray',
                backgroundColor: 'rgb(249, 242, 242)',
                color: 'black',
                fontFamily: 'Lato, sans-serif',
                cursor: 'pointer',
              }}
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0066cc',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontFamily: 'Lato, sans-serif',
              }}
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const { user } = session;
  const Component = component;

  return (
    <div className="authenticated-route">
      <Header user={user} />
      <div className="container">
        <Component user={user} />
      </div>
    </div>
  );
};
