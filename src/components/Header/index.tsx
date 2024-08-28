import { User } from '@supabase/supabase-js';
import './styles.css';
import supabase from '../../supabase';

type Props = {
  user: User;
};

export default function Header({ user }: Props) {
  const onSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div id="header">
      <div id="user">
        Logged in as {user.is_anonymous ? 'Anonymous' : user.email}
      </div>
      <div id="sign-out" onClick={onSignOut}>
        Sign out
      </div>
    </div>
  );
}
