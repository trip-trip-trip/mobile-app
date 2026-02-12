import FullButton from "@/components/FullButton";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import SettingActivate from "@/components/setting/SettingActivate";
import SettingTimeslot from "@/components/setting/SettingTimeslot";
import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SettingScreenProps {}

const SettingScreen = ({}: SettingScreenProps) => {
  return (
    <View
      style={{ width: "100%", height: "100%", backgroundColor: colors.WHITE }}
    >
      <Header
        label="setting"
        backgroundColor={colors.WHITE}
        labelColor={colors.NAVY}
        leftIcon={<GoBackIcon />}
      />
      <View style={styles.container}>
        <SettingActivate />
        <SettingTimeslot />
        <FullButton
          type="fill"
          label="저장하기"
          onPress={() => console.log("settings save button pressed")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 32,
  },
});

export default SettingScreen;
