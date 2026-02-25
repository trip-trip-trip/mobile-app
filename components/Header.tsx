import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  backgroundColor: string;
  labelColor: string;
};

const Header = ({
  label,
  leftIcon,
  rightIcon,
  backgroundColor,
  labelColor,
}: Props) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.side}>
        {leftIcon}
      </View>

      <View style={styles.center}>
        {label && (
          <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        )}
      </View>

      <View style={styles.side}>
        {rightIcon}
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    height: 120,
    flexDirection: "row",
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.NAVY,
    alignItems: "flex-end",
  },
  side: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "MonoplexKR-Medium",
    fontSize: 16,
    color: colors.NAVY,
  },
});
