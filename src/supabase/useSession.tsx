import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import supabase from '.';

export default function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isFetchingSession, setIsFetchingSession] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      setIsFetchingSession(true);
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setIsFetchingSession(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, isFetchingSession };
}
