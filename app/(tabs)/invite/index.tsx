import React, { useEffect, useState } from "react";
import { View, Alert, Share, ActivityIndicator } from "react-native";
import Header from "@/components/Header";
import InviteCard from "@/components/invite/InviteCard";
import { colors } from "@/constants/colors";
import GoBackIcon from "@/components/icons/GoBackIcon";
import * as Clipboard from "expo-clipboard";
import { createInvite, getInviteInfo } from "@/api/invite";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { InviteInfo } from "@/types/invite";

export default function InviteIndexScreen() {
  const params = useLocalSearchParams<{ tripId?: string }>();
  const router = useRouter();
  const tripId = params.tripId ? Number(params.tripId) : null;

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const goBack = () => {
      if (tripId) {
        router.replace(`/(tabs)/gallery/${tripId}` as any);
      } else {
        router.replace("/(tabs)/gallery");
      }
    };

    const initInvite = async () => {
      if (!tripId) {
        Alert.alert("오류", "초대할 여행 정보가 없습니다.", [
          { text: "확인", onPress: goBack },
        ]);
        return;
      }

      try {
        setIsLoading(true);
        const { inviteCode: code } = await createInvite(tripId);
        setInviteCode(code);
        const info = await getInviteInfo(code);
        setInviteInfo(info);
      } catch {
        Alert.alert("오류", "초대 코드 생성에 실패했습니다.", [
          { text: "확인", onPress: goBack },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    initInvite();
  }, [tripId]);

  const handleBack = () => {
    if (tripId) {
      router.replace(`/(tabs)/gallery/${tripId}` as any);
    } else {
      router.replace("/(tabs)/gallery");
    }
  };

  const getInviteLink = () =>
    inviteCode ? `tripshot://invite/InviteReceived?code=${inviteCode}` : null;

  const handleCopyLink = async () => {
    const url = getInviteLink();
    if (!url) return;
    await Clipboard.setStringAsync(url);
    Alert.alert("복사 완료", "초대 링크가 클립보드에 복사되었습니다.");
  };

  const handleKakaoShare = async () => {
    const url = getInviteLink();
    if (!url) return;
    await Share.share({
      message: `[TripShot] 신나는 여행에 초대합니다!\n링크를 눌러 참여하세요:\n${url}`,
    });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.CREAM }}>
        <ActivityIndicator size="large" color={colors.NAVY} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.CREAM }}>
      <Header
        label="친구 초대"
        leftIcon={<GoBackIcon onPress={handleBack} />}
        backgroundColor={colors.CREAM}
        labelColor={colors.NAVY}
      />
      <InviteCard
        type="sent"
        onCopyLink={handleCopyLink}
        onKakaoShare={handleKakaoShare}
        data={inviteInfo ?? undefined}
      />
    </View>
  );
}
