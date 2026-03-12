import { registerDevice } from "@/api/setting";
import type { AuthUser } from "@/types/auth";
import { removeHeader, setHeader } from "@/utils/header";
import {
  deleteSecureStore,
  getSecureStore,
  saveSecureStore,
} from "@/utils/secureStore";
import Constants, { ExecutionEnvironment } from "expo-constants";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

// Expo Go(SDK 53+)는 expo-notifications import만으로 Java 크래시 → 런타임에만 로드
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const Notifications = isExpoGo
  ? null
  : (require("expo-notifications") as typeof import("expo-notifications"));

type AuthContextValue = {
  user: AuthUser | null;
  signupToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAccessToken: (token: string, user: AuthUser) => Promise<void>;
  setSignupToken: (token: string) => void;
  logout: () => Promise<void>;
};

// true: 앱 재시작 시 로그인 유지 / false: 항상 로그아웃 상태로 시작
const PERSIST_LOGIN = false;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [signupToken, setSignupTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 SecureStore에서 저장된 인증 정보 로드
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        if (PERSIST_LOGIN) {
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

    // FCM 디바이스 토큰 등록 (중복 등록 방지: SecureStore에 저장된 토큰과 비교)
    // Expo Go는 네이티브 FCM 토큰 발급 불가 → 건너뜀
    try {
      if (!isExpoGo && Notifications) {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === "granted") {
          const nativeToken = await Notifications.getDevicePushTokenAsync();
          const deviceToken = nativeToken.data;
          const storedToken = await getSecureStore("deviceToken");
          if (storedToken !== deviceToken) {
            await registerDevice({
              platform: Platform.OS,
              deviceToken,
            });
            await saveSecureStore("deviceToken", deviceToken);
          }
        }
      }
    } catch {
      // 토큰 등록 실패는 로그인 흐름을 막지 않음
    }
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
      deleteSecureStore("deviceToken"),
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
