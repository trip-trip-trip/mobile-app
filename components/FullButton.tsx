import { colors } from "@/constants/colors";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  type: "fill" | "outlined";
  label: string;
  icon?: React.ReactNode;
  onPress?: () => void;
};

const FullButton = ({ type, label, icon, onPress }: Props) => {
  const isFill = type === "fill";

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, isFill ? styles.fill : styles.outlined]}
    >
      <Text
        style={[styles.label, { color: isFill ? colors.CREAM : colors.NAVY }]}
      >
        {label}
      </Text>
      {icon}
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
    borderWidth: 1,
    borderColor: colors.NAVY,
  },
  label: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 16,
    textAlign: "center",
  },
});
