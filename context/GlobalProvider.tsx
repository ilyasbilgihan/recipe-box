import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';

import { getItem, setItem } from '~/core/storage';
import { Session } from '@supabase/supabase-js';
import { supabase } from '~/utils/supabase';
import { useTranslation } from 'react-i18next';

type Mode = 'light' | 'dark' | undefined;

export interface GlobalContextValue {
  colorMode: Mode;
  ifLight: (a: any, b: any) => any;
  setColorMode: React.Dispatch<React.SetStateAction<Mode>>;
  session: Session | null;
  toggleColorMode: () => void;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
}

const GlobalContext = React.createContext<GlobalContextValue>({} as GlobalContextValue);

export const GlobalProvider: React.FC<PropsWithChildren> = (props) => {
  const [session, setSession] = useState<Session | null>(null);
  const [colorMode, setColorMode] = useState<Mode>('light');
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<string>('en');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    getColorMode();
    getLanguage();
  }, []);

  useEffect(() => {
    setItem('language', language);
  }, [language]);

  const getLanguage = async () => {
    const item = await getItem('language');
    if (item) {
      i18n.changeLanguage(item as string);
    }
  };

  const getColorMode = async () => {
    const item = await getItem('colorMode');
    if (item) {
      setColorMode(item as Mode);
    }
  };

  const toggleColorMode = async () => {
    let targetMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(targetMode as Mode);
    setItem('colorMode', targetMode);
  };

  const ifLight = (a: any, b: any) => {
    return colorMode == 'light' ? a : b;
  };

  return (
    <GlobalContext.Provider
      value={{ colorMode, ifLight, setColorMode, session, toggleColorMode, setLanguage }}>
      {props.children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error('useSomeContext must be used within SomeProvider');
  return ctx;
};
