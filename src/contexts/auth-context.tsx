"use client";
import { ReactNode, createContext, useEffect, useState } from "react";
import { IAuthUser } from '@/utils/interfaces/auth/i-auth-user';
import useCookie from '@/hooks/use-cookie';

interface TAuthContext {
  user: IAuthUser | null;
  setUser: (user: IAuthUser | null) => void;
}

export const AuthContext = createContext<TAuthContext>({
  user: null,
  setUser: () => {},
});

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<IAuthUser | null>(null);
  const { getCookie } = useCookie();

  useEffect(() => {
    if (!user) {
      let existingUser = null;
      const getFromCookie = async () => (existingUser = getCookie("user"));
      getFromCookie();

      if (existingUser) {
        try {
          setUser(JSON.parse(existingUser));
        } catch (e) {
          console.log(e);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};