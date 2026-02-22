import axiosInstance from "./axios";
import type { AuthUser, TokenRes } from "@/types/auth";

// POST /signup/complete — signup 토큰으로 회원가입 완료, access 토큰 반환
async function completeSignup(
  userId: string,
  signupToken: string,
): Promise<TokenRes> {
  const { data } = await axiosInstance.post(
    "/signup/complete",
    { userId },
    { headers: { Authorization: `Bearer ${signupToken}` } },
  );
  return data.result as TokenRes;
}

// GET /users/me — access 토큰으로 내 프로필 조회 (axios 공통 헤더 사용)
async function getMyProfile(): Promise<AuthUser> {
  const { data } = await axiosInstance.get("/users/me");
  return data.result as AuthUser;
}

export { completeSignup, getMyProfile };
