import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { ComponentType } from 'react';
import { User } from '@supabase/supabase-js';
import useSession from '../supabase/useSession';
import supabase from '../supabase';
import Header from '../Header';
import './styles.css';

type Props = {
  component: ComponentType<{ user: User }>;
};

export const AuthenticatedRoute = ({ component }: Props) => {
  const session = useSession();
  if (!session) {
    return (
      <div className="container">
        <div className="title">Notes App</div>
        <div className="sub-title">Sign in or sign up to continue</div>

        <Auth
          supabaseClient={supabase}
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
                fontFamily: "'Lato', sans-serif",
                backgroundColor: '#f9f2f2',
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
