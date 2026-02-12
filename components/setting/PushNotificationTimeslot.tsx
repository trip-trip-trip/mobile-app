import { colors } from "@/constants/colors";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {};

const SLOT_LIST = ["오전", "오후", "저녁", "새벽", "점심", "밤"];

const SettingTimeslot = ({}: Props) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSlot = (slot: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) {
        next.delete(slot);
      } else {
        next.add(slot);
      }
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>알림 시간대 설정</Text>
        <Text style={styles.subtitle}>선호하는 시간대를 선택해주세요</Text>
      </View>
      <View style={styles.optionBlock}>
        {SLOT_LIST.map((slot) => {
          const isSelected = selected.has(slot);
          return (
            <Pressable
              key={slot}
              onPress={() => toggleSlot(slot)}
              style={[
                styles.slot,
                { backgroundColor: isSelected ? colors.NAVY : colors.CREAM },
              ]}
            >
              <Text
                style={[
                  styles.slotText,
                  { color: isSelected ? colors.CREAM : colors.NAVY },
                ]}
              >
                {slot}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default SettingTimeslot;

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  textContainer: {
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 16,
    color: colors.NAVY,
    letterSpacing: -1.6,
  },
  subtitle: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 12,
    color: colors.NAVY,
  },
  optionBlock: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slot: {
    width: "31%",
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.NAVY,
    backgroundColor: colors.CREAM,
  },
  slotText: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 14,
    color: colors.NAVY,
  },
});
