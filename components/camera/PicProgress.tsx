import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  current: number; // 현재 찍은 횟수 (1~4)
};

const TOTAL = 4;

// 숫자를 서수(st, nd, rd, th)로 바꿔주는 함수
const getOrdinal = (n: number) => {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
};

const PicProgress = ({ current }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={{ color: "red", fontFamily: "MonoplexKR-Medium", fontSize: 12 }}>
        {` ${getOrdinal(current)} PIC`}
      </Text>
      <View style={styles.progressColumn}>
        {Array.from({ length: TOTAL }).map((_, i) => {
          const index = i + 1;
          // 현재 찍고 있는 단계
          if (index === current) {
            return <View key={i} style={styles.currentBox} />;
          }
          // 이미 찍은 단계
          if (index < current) {
            return <View key={i} style={styles.aboveBox} />;
          }
          // 아직 안 찍은 단계
          return <View key={i} style={styles.belowBox} />;
        })}
      </View>
    </View>
  );
};

export default PicProgress;


const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "column",
    gap: 8,
  },
  progressColumn: {
    flexDirection: "column",
    gap: 8,
    paddingBottom: 50,
    paddingRight: 20,
  },
  currentBox: {
    width: 16,
    height: 16,
    backgroundColor: "#EA4335",
    borderWidth: 1,
    borderColor: "#EA4335",
    borderRadius: 4,
  },

  aboveBox: {
    width: 16,
    height: 16,
    backgroundColor: "rgba(234,67,53,0.30)",
    borderWidth: 1,
    borderColor: "#EA4335",
    borderRadius: 4,
  },

  belowBox: {
    width: 16,
    height: 16,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#EA4335",
    borderRadius: 4,
  },
});
