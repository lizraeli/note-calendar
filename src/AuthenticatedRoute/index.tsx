import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { ComponentType } from 'react';
import { User } from '@supabase/supabase-js';
import useSession from '../supabase/useSession';
import supabase, { supabaseRedirectUrl } from '../supabase';
import Header from '../components/Header';
import styles from './styles.module.css';
import Spinner from '../components/Spinner';

type Props = {
  component: ComponentType<{ user: User }>;
};

export const AuthenticatedRoute = ({ component }: Props) => {
  const { session, isFetchingSession } = useSession();

  const signInAnonymously = async () => {
    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error('error signing in anonymously');
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

        <Auth
          supabaseClient={supabase}
          redirectTo={supabaseRedirectUrl}
          appearance={{
            theme: ThemeSupa,
            style: {
              container: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
              label: {
                fontFamily: "'Lato', sans-serif",
                color: 'black',
              },
              button: {
                fontFamily: 'Lato, sans-serif',
                backgroundColor: 'rgb(249, 242, 242)',
                color: 'black',
                borderColor: 'lightgray',
                borderRadius: '10px',
              },
              message: {
                fontFamily: "'Lato', sans-serif",
              },
              input: {
                fontFamily: "'Lato', sans-serif",
                borderRadius: '2px',
              },
              anchor: {
                fontFamily: "'Lato', sans-serif",
              },
            },
          }}
          socialLayout="vertical"
          providers={['google']}
        />
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
