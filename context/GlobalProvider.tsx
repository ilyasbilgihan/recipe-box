import React, { PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';

import {
  Session,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from '@supabase/supabase-js';
import { supabase } from '~/utils/supabase';
export interface GlobalContextValue {
  session: Session | null;
  loading: boolean;
  signIn: (credentials: SignInWithPasswordCredentials) => void;
  signUp: (credentials: SignUpWithPasswordCredentials) => void;
}
import { Alert } from 'react-native';
import { router } from 'expo-router';

const GlobalContext = React.createContext<GlobalContextValue>({} as GlobalContextValue);

export const GlobalProvider: React.FC<PropsWithChildren> = (props) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const signIn = async (credentials: SignInWithPasswordCredentials) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) Alert.alert(error.message);
    setSession(data.session);
    setLoading(false);
  };
  async function signUp(credentials: SignUpWithPasswordCredentials) {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp(credentials);

    if (error) Alert.alert(error.message);
    setSession(data.session);
    setLoading(false);
  }

  return (
    <GlobalContext.Provider value={{ session, loading, signIn, signUp }}>
      {props.children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error('useSomeContext must be used within SomeProvider');
  return ctx;
};
