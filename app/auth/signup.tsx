import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import InputField from "@/components/InputField";
import { colors } from "@/constants/colors";
import FullButton from "@/components/FullButton";
import { useCompleteSignup } from "@/hooks/queries/useAuth";
import { useAuthContext } from "@/contexts/AuthContext";

// 영문, 숫자, 언더스코어만 허용, 8~16자
const ID_REGEX = /^[a-zA-Z0-9_]{8,16}$/;

const Signup = () => {
  const [id, setId] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Android deep link 경로: tripshot://auth/signup?level=signup&token=...
  // openAuthSessionAsync 경로: context에 이미 signupToken이 설정됨
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const { signupToken, setSignupToken } = useAuthContext();

  useEffect(() => {
    if (tokenParam && !signupToken) {
      setSignupToken(tokenParam);
    }
  }, [tokenParam]);

  const { mutate: completeSignup, isPending, error } = useCompleteSignup();

  const handleIdChange = (text: string) => {
    setId(text);
    setValidationError(null);
  };

  const handleSubmit = () => {
    if (!ID_REGEX.test(id)) {
      setValidationError(
        "영문, 숫자, 언더스코어(_)만 사용 가능하며 8~16자여야 합니다.",
      );
      return;
    }
    completeSignup(id);
  };

  const serverError =
    error instanceof Error ? error.message : error ? "오류가 발생했습니다." : null;
  const displayError = validationError ?? serverError;

  return (
    <View style={styles.container}>
      <Header
        backgroundColor={colors.CLOUD}
        label="회원가입"
        labelColor={colors.NAVY}
        leftIcon={<GoBackIcon />}
      />
      <View style={styles.contentContainer}>
        <View style={styles.instructionContainer}>
          <Text style={styles.title}>ID를 만들어요</Text>
          <Text style={styles.description}>
            트립샷에서 사용하실 ID를 입력해주세요. ID는 고유한 이름으로 영문,
            숫자, 언더스코어(_)만 사용할 수 있어요.
          </Text>
          <InputField
            label="ID"
            value={id}
            onChangeText={handleIdChange}
            placeholder="8자 이상 16자 이내"
          />
          {displayError && (
            <Text style={styles.errorText}>{displayError}</Text>
          )}
        </View>
        <FullButton
          type="fill"
          label={isPending ? "처리 중..." : "시작하기!"}
          onPress={isPending ? undefined : handleSubmit}
        />
      </View>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  contentContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 52,
    alignSelf: "stretch",
  },
  instructionContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 20,
    alignSelf: "stretch",
  },
  title: {
    color: colors.NAVY,
    fontFamily: "MonoplexKR-SemiBold",
    fontSize: 20,
  },
  description: {
    color: colors.NAVY,
    fontFamily: "MonoplexKR-Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  errorText: {
    color: colors.RED,
    fontFamily: "MonoplexKR-Regular",
    fontSize: 13,
  },
});
