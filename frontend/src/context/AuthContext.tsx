import { createContext, useContext, useState, useEffect } from "react";

import type { ReactNode } from "react";

interface UserInfo {
  id?: number;
  name?: string;
  role?: string;
  status?: string;
  profileImgUrl?: string;
}

interface AuthContextType {
  token: string | null;
  user: UserInfo | null;
  isLoggedIn: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: UserInfo | null) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [user, setUserState] = useState<UserInfo | null>(
    JSON.parse(localStorage.getItem("userInfo") || "null")
  );

  const setToken = (token: string | null) => {
    setTokenState(token);
    if (token) localStorage.setItem("accessToken", token);
    else localStorage.removeItem("accessToken");
  };

  const setUser = (user: UserInfo | null) => {
    setUserState(user);
    if (user) localStorage.setItem("userInfo", JSON.stringify(user));
    else localStorage.removeItem("userInfo");
  };

  const clearAuth = () => {
    setToken(null);
    setUser(null);
  };

  const isLoggedIn = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{ token, user, isLoggedIn, setToken, setUser, clearAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth는 AuthProvider 내부에서만 사용해야 합니다.");
  return ctx;
};
