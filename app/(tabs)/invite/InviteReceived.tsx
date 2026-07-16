import React, { useEffect, useState } from "react";
import { Alert, View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import InviteCard from "@/components/invite/InviteCard";
import { colors } from "@/constants/colors";
import { acceptInvite, getInviteInfo } from "@/api/invite";
import { endTrip } from "@/api/trip";
import { postCreateReel } from "@/api/album";
import queryClient from "@/api/queryClient";
import { tripKeys } from "@/hooks/queries/gallery/tripKeys";
import { useGalleryTripsQuery } from "@/hooks/queries/gallery/useAllTrips";
import { isAxiosError } from "axios";
import type { InviteInfo } from "@/types/invite";

export default function InviteReceivedScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();

  const [inviteData, setInviteData] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // 진행 중(ACTIVE) 여행이 있으면 초대 수락 전에 종료 여부를 확인
  const { data: tripsData } = useGalleryTripsQuery();
  const ongoingTrip =
    tripsData?.activeTrip?.status === "ACTIVE" ? tripsData.activeTrip : null;

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

  const joinTrip = async () => {
    if (!code) return;
    try {
      await acceptInvite(code);
      await queryClient.invalidateQueries({ queryKey: tripKeys.all });
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

  // 진행 중인 여행 종료 후 초대 수락
  const endOngoingTripAndJoin = async (tripId: number) => {
    setProcessing(true);
    try {
      await endTrip(tripId);

      // 여행 종료 직후 릴 생성 요청 (실패해도 참여는 진행)
      try {
        await postCreateReel(tripId);
      } catch (reelErr) {
        console.warn("[Reel create skipped]", reelErr);
      }

      await queryClient.invalidateQueries({ queryKey: tripKeys.all });
      await joinTrip();
    } catch (error) {
      console.error("[End trip before join error]", error);
      Alert.alert(
        "오류",
        "진행 중인 여행 종료에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleAccept = async () => {
    if (!code) {
      Alert.alert("오류", "초대 코드가 없습니다.");
      return;
    }
    if (processing) return;

    // 진행 중인 여행이 없으면 바로 참여
    if (!ongoingTrip) {
      setProcessing(true);
      try {
        await joinTrip();
      } finally {
        setProcessing(false);
      }
      return;
    }

    const memberCount = ongoingTrip.members?.length ?? 0;
    const isSharedTrip = memberCount >= 2;

    Alert.alert(
      "진행 중인 여행 종료",
      isSharedTrip
        ? `나를 포함해 ${memberCount}명이 '${ongoingTrip.title}' 여행을 진행 중입니다.\n지금 참여하면 모든 멤버의 여행이 즉시 종료되고 사진 현상이 시작됩니다.`
        : `진행 중인 '${ongoingTrip.title}' 여행이 있습니다.\n지금 참여하면 이 여행이 즉시 종료되고 사진 현상이 시작됩니다.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: isSharedTrip ? "모두 종료하고 참여" : "종료하고 참여",
          style: "destructive",
          onPress: () => endOngoingTripAndJoin(ongoingTrip.id),
        },
      ],
    );
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
