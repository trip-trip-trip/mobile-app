import { colors } from "@/constants/colors";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  type: "fill" | "outlined" | "kakao";
  label: string;
  icon?: React.ReactNode;
  onPress?: () => void;
};

const FullButton = ({ type, label, icon, onPress }: Props) => {
  const isFill = type === "fill";

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        isFill
          ? styles.fill
          : type === "outlined"
            ? styles.outlined
            : styles.kakao,
      ]}
    >
      {icon}
      <Text
        style={[
          styles.label,
          {
            color:
              type === "fill"
                ? colors.CREAM
                : type === "outlined"
                  ? colors.NAVY
                  : "#3C1E1E",
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default FullButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 62,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
    gap: 10,
    borderRadius: 30,
  },
  fill: {
    backgroundColor: colors.NAVY,
  },
  outlined: {
    backgroundColor: "transparent",
    borderColor: colors.NAVY,
    borderWidth: 1,
  },
  label: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 16,
    textAlign: "center",
  },
  kakao: {
    backgroundColor: "#FEE502",
    borderRadius: 30,
    borderColor: "transparent",
  },
});
