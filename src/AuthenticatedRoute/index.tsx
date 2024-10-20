import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { ComponentType } from 'react';
import { User } from '@supabase/supabase-js';
import useSession from '../supabase/useSession';
import supabase, { supabaseRedirectUrl } from '../supabase';
import Header from '../components/Header';
import styles from './styles.module.css';

type Props = {
  component: ComponentType<{ user: User }>;
};

export const AuthenticatedRoute = ({ component }: Props) => {
  const session = useSession();

  const signInAnonymously = async () => {
    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error('error signing in anonymously');
    }
  };

  if (!session) {
    return (
      <div className={styles.container}>
        <div className={styles.title}>Notes App</div>

        <div className={styles['sub-container']}>
          <div className="sub-title">Sign in or sign up to continue.</div>

          <button onClick={signInAnonymously}>Sign in anonymously</button>
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
