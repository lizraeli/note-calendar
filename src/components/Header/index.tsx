import { User } from '@supabase/supabase-js';
import styles from './styles.module.css';
import supabase from '../../supabase';
import { useNavigate } from 'react-router-dom';

type Props = {
  user: User;
};

export default function Header({ user }: Props) {
  const navigate = useNavigate();
  const onSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out: ', error);
    } else {
      navigate('/');
    }
  };

  return (
    <div id={styles.header}>
      <div>{user.is_anonymous ? 'anonymous' : user.email}</div>
      <div id={styles.signOut} onClick={onSignOut}>
        Sign out
      </div>
    </div>
  );
}
