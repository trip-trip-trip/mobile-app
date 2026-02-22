import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  type?: "short" | "long";
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

const InputField = ({
  type = "short",
  label,
  value,
  onChangeText,
  placeholder,
}: Props) => {
  const isLong = type === "long";

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, isLong && styles.inputLong]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.NAVY + "55"}
        multiline={isLong}
        textAlignVertical={isLong ? "top" : "center"}
      />
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    gap: 8,
  },
  label: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 14,
    color: colors.NAVY,
  },
  input: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 14,
    color: colors.NAVY,
    padding: 20,
    alignSelf: "stretch",
    borderBottomWidth: 1,
    borderBottomColor: colors.NAVY,
  },
  inputLong: {
    minHeight: 100,
  },
});
