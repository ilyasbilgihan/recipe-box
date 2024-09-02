import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';

import { Session } from '@supabase/supabase-js';
import { supabase } from '~/utils/supabase';

type Mode = 'light' | 'dark' | undefined;

export interface GlobalContextValue {
  colorMode: Mode;
  ifLight: (a: any, b: any) => any;
  setColorMode: React.Dispatch<React.SetStateAction<Mode>>;
  session: Session | null;
}

const GlobalContext = React.createContext<GlobalContextValue>({} as GlobalContextValue);

export const GlobalProvider: React.FC<PropsWithChildren> = (props) => {
  const [session, setSession] = useState<Session | null>(null);
  const [colorMode, setColorMode] = useState<Mode>('dark');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const ifLight = (a: any, b: any) => {
    return colorMode == 'light' ? a : b;
  };

  return (
    <GlobalContext.Provider value={{ colorMode, ifLight, setColorMode, session }}>
      {props.children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error('useSomeContext must be used within SomeProvider');
  return ctx;
};
