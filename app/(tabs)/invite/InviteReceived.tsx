import GoBackIcon from "@/assets/icons/GoBackIcon";
import Header from "@/components/Header";
import InviteCard from "@/components/invite/InviteCard";
import { colors } from "@/constants/colors";
import React from "react";
import { View } from "react-native";

export default function InviteReceivedScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.CREAM }}>
      <Header
        label="여행초대"
        backgroundColor={colors.CREAM}
        labelColor={colors.NAVY}
        leftIcon={<GoBackIcon />}
      />

      <InviteCard type="received" />
    </View>
  );
}
