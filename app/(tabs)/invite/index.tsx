import React, { useState, useEffect } from "react";
import { View, Alert, Share } from "react-native";
import Header from "@/components/Header";
import InviteCard from "@/components/invite/InviteCard";
import { colors } from "@/constants/colors";
import GoBackIcon from "@/components/icons/GoBackIcon";
import * as Clipboard from "expo-clipboard";
import { createInvite } from "@/api/invite";
import { getActiveTrips } from "@/api/trip";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getActiveTripData } from "@/api/gallery";

export default function InviteIndexScreen() {
  const { tripId: paramTripId } = useLocalSearchParams<{ tripId: string }>();

  // 1. 현재 초대하려는 여행의 실제 데이터를 가져옴
  const { data: tripStatus } = useQuery({
    queryKey: ["activeTripData"],
    queryFn: getActiveTripData,
  });

  // 2. 현재 선택된 tripId에 해당하는 여행 정보를 찾음
  const activeTripData = tripStatus?.trip?.find(
    (t: any) => t.id === Number(paramTripId)
  ) || tripStatus?.trip?.[0];

  const getInviteLink = async () => {
    let targetTripId: number;
    try {
      if (paramTripId) {
        targetTripId = Number(paramTripId);
      } else if (activeTripData) {
        targetTripId = activeTripData.id;
      } else {
        throw new Error("여행 정보가 없습니다.");
      }

      const { inviteCode } = await createInvite(targetTripId);
      return `tripshot://invite/InviteReceived?code=${inviteCode}`;
    } catch (err) {
      console.error("초대 링크 생성 실패:", err);
      Alert.alert("오류", "초대 링크를 생성할 수 없습니다.");
      return null;
    }
  };

  const handleCopyLink = async () => {
    const url = await getInviteLink();
    if (url) {
      await Clipboard.setStringAsync(url);
      Alert.alert("복사 완료", `초대 링크가 복사되었습니다.\n${url}`);
    }
  };

  const handleKakaoShare = async () => {
    const url = await getInviteLink();
    if (url) {
      await Share.share({
        message: `[TripShot] '${activeTripData?.title || "여행"}'에 초대합니다!\n링크를 눌러 참여하세요:\n${url}`,
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.CREAM }}>
      <Header 
        label="친구 초대" 
        leftIcon={<GoBackIcon />} 
        backgroundColor={colors.CREAM} 
        labelColor={colors.NAVY} 
      />
      {/* 3. data prop에 실제 여행 데이터를 전달 */}
      <InviteCard 
        type="sent" 
        onCopyLink={handleCopyLink} 
        onKakaoShare={handleKakaoShare} 
        data={activeTripData}
      />
    </View>
  );
}