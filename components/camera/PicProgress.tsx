import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  current: number;
};

const TOTAL = 4;

const PicProgress = ({ current }: Props) => {
  return (
    <View style={styles.container}>
      <Text
        style={{ color: "red", fontFamily: "MonoplexKR-Medium", fontSize: 12 }}
      >
        {` ${current}rd PIC`}
      </Text>
      <View style={styles.progressColumn}>
        {Array.from({ length: TOTAL }).map((_, i) => {
          const index = i + 1;

          if (index === current) {
            return <View key={i} style={styles.currentBox} />;
          }

          if (index < current) {
            return <View key={i} style={styles.aboveBox} />;
          }

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
