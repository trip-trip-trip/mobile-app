import { useMutation, useQuery } from "@tanstack/react-query";
import { completeSignup, getMyProfile } from "@/api/auth";
import { useAuthContext } from "@/contexts/AuthContext";
import type { AuthUser } from "@/types/auth";

// GET /users/me — 현재 로그인 유저 프로필 조회
export function useGetMyProfile() {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: getMyProfile,
    enabled: isAuthenticated,
  });
}

// POST /signup/complete — signup 토큰으로 회원가입 완료
export function useCompleteSignup() {
  const { signupToken, setAccessToken } = useAuthContext();

  return useMutation({
    mutationFn: (userId: string) => {
      if (!signupToken) throw new Error("signup 토큰이 없습니다.");
      return completeSignup(userId, signupToken);
    },
    onSuccess: async (result) => {
      if (result.user) {
        await setAccessToken(result.jwtToken, result.user as AuthUser);
      }
      // isAuthenticated가 true가 되면 라우팅 가드가 (tabs)로 이동시킴
    },
  });
}

// 인증 상태 + 뮤테이션을 묶어서 제공하는 통합 훅
function useAuth() {
  const authContext = useAuthContext();
  const completeSignupMutation = useCompleteSignup();
  return { ...authContext, completeSignupMutation };
}

export default useAuth;
