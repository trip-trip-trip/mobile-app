import { colors } from "@/constants";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface FilterTabProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function FilterTab({
  label,
  isSelected,
  onPress,
}: FilterTabProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        isSelected ? styles.selectedButton : styles.unselectedButton,
      ]}
    >
      <Text
        style={[
          styles.text,
          isSelected ? styles.selectedText : styles.unselectedText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20, // 양옆 패딩 20
    paddingVertical: 4, // 위아래 패딩 4
    borderRadius: 20, // 보더 Radius 20
    marginRight: 14, // 버튼 사이 간격
    alignSelf: "flex-start",
  },
  selectedButton: {
    backgroundColor: colors.NAVY, // 선택 시 배경색 (원하시는 색상으로 변경 가능)
  },
  unselectedButton: {
    backgroundColor: colors.CREAM,
  },
  text: {
    fontSize: 10, // 글씨 크기 10px
    fontWeight: "700",
  },
  selectedText: {
    color: colors.CLOUD,
  },
  unselectedText: {
    color: colors.NAVY,
  },
});
