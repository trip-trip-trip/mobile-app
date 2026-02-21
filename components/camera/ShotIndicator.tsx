import { StyleSheet, Text, View } from "react-native";

import ShotIndicatorBg from "@/assets/icons/ShotIndicator.svg";

type Props = {
  current: number; // n번째
};

const ShotIndicator = ({ current }: Props) => {
  return (
    <View style={styles.container}>
      <ShotIndicatorBg width={86} height={27} />
      <Text style={styles.number}>{current}</Text>
    </View>
  );
};

export default ShotIndicator;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    width: 86,
    height: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    width: 86,
    height: 27,
  },
  number: {
    position: "absolute",
    fontSize: 14,
    fontWeight: "700",
    color: "black",
  },
});
