import { colors } from "@/constants/colors";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  onPress?: () => void;
};

const GoogleLoginButton = ({ onPress }: Props) => {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.label}>Google로 계속하기</Text>
    </Pressable>
  );
};

export default GoogleLoginButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
    gap: 10,
    borderRadius: 30,
    backgroundColor: colors.NAVY,
  },
  label: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 16,
    color: colors.CREAM,
    textAlign: "center",
  },
});
