import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

import { completeSignup } from "@/api/auth";
import { setHeader } from "@/utils/header";
import { saveSecureStore } from "@/utils/secureStore";

type Vars = { userId: string; signupToken: string };

export const useCompleteSignup = () => {
  return useMutation({
    mutationFn: ({ userId, signupToken }: Vars) =>
      completeSignup(userId, signupToken),
    onSuccess: async (tokenRes) => {
      // ✅ TokenRes 구조에 맞춰 key 이름만 확인해줘야 함
      // 예: tokenRes.accessToken / tokenRes.result.accessToken 등
      const accessToken = tokenRes.jwtToken; // <- TokenRes 타입에 맞게
      // const refreshToken = tokenRes.refreshToken;

      setHeader("Authorization", `Bearer ${accessToken}`);
      await saveSecureStore("accessToken", accessToken);
      // if (refreshToken) await saveSecureStore("refreshToken", refreshToken);

      router.replace("/(tabs)/gallery");
    },
  });
};
