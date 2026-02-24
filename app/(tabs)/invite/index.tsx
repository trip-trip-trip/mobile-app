import React from "react";
import { View, Alert, Share } from "react-native";
import Header from "@/components/Header";
import InviteCard from "@/components/invite/InviteCard";
import { colors } from "@/constants/colors";
import GoBackIcon from "@/components/icons/GoBackIcon";
import * as Clipboard from "expo-clipboard";
import { createInvite } from "@/api/invite";
import { getActiveTrips } from "@/api/trip";
import { useLocalSearchParams } from "expo-router";

export default function InviteIndexScreen() {
const params = useLocalSearchParams();
  console.log("🔗 InviteIndexScreen에 들어온 전체 params:", params);console.log("🔗 InviteIndexScreen에 들어온 전체 params:", params);
const paramTripId = params.tripId;

  const getInviteLink = async () => {
  let targetTripId: number;

  try {
    // 1. 파라미터로 넘어온 tripId가 있는지 최우선으로 확인
    if (paramTripId) {
      targetTripId = Number(paramTripId);
      console.log("📍 전달받은 tripId 사용:", targetTripId);
    } else {
      // 파라미터가 없을 때만 서버에 물어봄
      const response = await getActiveTrips();
      const trips = response?.trip || [];
      
      if (trips.length === 0) {
        console.log("서버에 진행 중인 여행이 없음");
        // 여기서 에러를 내거나 유저에게 알림을 줘야 함
        throw new Error("초대할 수 있는 여행이 없습니다.");
      } else {
        const activeTrip = trips.find((t: any) => t.status === "ACTIVE") || trips[0];
        targetTripId = activeTrip.id;
      }
    }

    // 2. 서버에 초대 코드 요청 (이제 targetTripId는 39가 될 거야)
    const { inviteCode } = await createInvite(targetTripId);
    return `tripshot://invite/InviteReceived?code=${inviteCode}`;

  } catch (err) {
    console.log("❌ 초대 링크 생성 실패:", err);
    // 여기서 Alert을 띄워주면 좋아
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
      // 카카오톡이나 다른 앱으로 공유 시에도 이 URL이 전달됨
      await Share.share({
        message: `[TripShot] 신나는 여행에 초대합니다!\n링크를 눌러 참여하세요:\n${url}`,
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
      <InviteCard 
        type="sent" 
        onCopyLink={handleCopyLink} 
        onKakaoShare={handleKakaoShare} 
      />
    </View>
  );
}
