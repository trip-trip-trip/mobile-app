import React, { useEffect, useState } from "react";
import { Alert, View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import InviteCard from "@/components/invite/InviteCard";
import { colors } from "@/constants/colors";
import { acceptInvite, getInviteInfo } from "@/api/invite";
import { isAxiosError } from "axios";
import type { InviteInfo } from "@/types/invite";

export default function InviteReceivedScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();

  const [inviteData, setInviteData] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInviteDetail = async () => {
      if (!code) return;
      try {
        setLoading(true);
        const data = await getInviteInfo(code);
        setInviteData(data);
      } catch {
        Alert.alert("유효하지 않은 초대", "링크가 만료되었거나 코드가 잘못되었습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchInviteDetail();
  }, [code]);

  const handleAccept = async () => {
    if (!code) {
      Alert.alert("오류", "초대 코드가 없습니다.");
      return;
    }

    try {
      await acceptInvite(code);
      router.replace("/(tabs)/gallery");
    } catch (error) {
      if (isAxiosError(error)) {
        const serverMessage = error.response?.data?.message || "초대 수락에 실패했습니다.";
        Alert.alert("참여 실패", serverMessage);
        return;
      }
      Alert.alert("오류", "잠시 후 다시 시도해주세요.");
    }
  };

  const handleDecline = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.CREAM }}>
        <ActivityIndicator size="large" color={colors.NAVY} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.CREAM }}>
      <Header
        label="여행 초대"
        backgroundColor={colors.CREAM}
        labelColor={colors.NAVY}
      />
      <InviteCard
        type="received"
        onAccept={handleAccept}
        onDecline={handleDecline}
        data={inviteData ?? undefined}
      />
    </View>
  );
}
