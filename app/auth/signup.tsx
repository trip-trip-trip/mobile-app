import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import InputField from "@/components/InputField";
import { colors } from "@/constants/colors";
import FullButton from "@/components/FullButton";

const Signup = () => {
  const [id, setId] = useState("");

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
            onChangeText={setId}
            placeholder="8자 이상 16자 이내"
          />
        </View>
        <FullButton type="fill" label="시작하기!" />
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
});
