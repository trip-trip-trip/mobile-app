import React, { createContext, useContext, useEffect, useState } from "react";
import { setHeader, removeHeader } from "@/utils/header";
import {
  saveSecureStore,
  getSecureStore,
  deleteSecureStore,
} from "@/utils/secureStore";
import type { AuthUser } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  signupToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAccessToken: (token: string, user: AuthUser) => Promise<void>;
  setSignupToken: (token: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [signupToken, setSignupTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 SecureStore에서 저장된 인증 정보 로드
  // __DEV__ 환경에서는 항상 로그인 화면부터 시작
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        if (!__DEV__) {
          const [token, userJson] = await Promise.all([
            getSecureStore("accessToken"),
            getSecureStore("authUser"),
          ]);
          if (token && userJson) {
            setHeader("Authorization", `Bearer ${token}`);
            setUser(JSON.parse(userJson) as AuthUser);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredAuth();
  }, []);

  // access 토큰 + 유저 정보 저장 (SecureStore + axios 헤더)
  const setAccessToken = async (token: string, userData: AuthUser) => {
    setHeader("Authorization", `Bearer ${token}`);
    await Promise.all([
      saveSecureStore("accessToken", token),
      saveSecureStore("authUser", JSON.stringify(userData)),
    ]);
    setUser(userData);
    setSignupTokenState(null);
  };

  // signup 토큰은 메모리에만 보관 (회원가입 플로우 중 임시 사용)
  const setSignupToken = (token: string) => {
    setSignupTokenState(token);
  };

  const logout = async () => {
    removeHeader("Authorization");
    await Promise.all([
      deleteSecureStore("accessToken"),
      deleteSecureStore("authUser"),
    ]);
    setUser(null);
    setSignupTokenState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signupToken,
        isLoading,
        isAuthenticated: !!user,
        setAccessToken,
        setSignupToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
