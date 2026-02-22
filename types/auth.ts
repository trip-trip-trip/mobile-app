export type TokenLevel = "access" | "signup";

export type AuthUser = {
  id: number;
  userId: string;
  avatarUrl: string | null;
};

export type TokenRes = {
  level: TokenLevel;
  jwtToken: string;
  user: AuthUser | null;
};
