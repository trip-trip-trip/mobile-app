import SwitchCameraIcon from "@/assets/icons/switchcam.svg";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
type Props = {
  onPress: () => void;
};

const SwitchCameraButton = ({ onPress }: Props) => {
  return (
    <Pressable onPress={onPress} style={styles.root}>
      <Text style={styles.text}>Switch Cam</Text>
      <View style={styles.iconWrap}>
        <Image
          source={require("@/assets/camera/switchoutline.png")}
          style={styles.circle}
        />
        <View style={styles.outline}>
          <SwitchCameraIcon width={47.5} height={47} />
        </View>
      </View>
    </Pressable>
  );
};

export default SwitchCameraButton;

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    gap: 6,
  },
  iconWrap: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  outline: {
    position: "absolute",
    width: 47.5,
    height: 47,
  },
  circle: {
    position: "absolute",
  },
  icon: {
    width: 26,
    height: 26,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "MonoplexKR-Medium",
  },
});
