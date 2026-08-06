import { AlbumCard } from "@/components/gallery/AlbumCard";
import DevelopPromptModal from "@/components/gallery/DevelopPromptModal";
import { Ticket } from "@/components/gallery/Ticket";
import { Title } from "@/components/gallery/Title";
import Header from "@/components/Header";
import CameraIcon from "@/components/icons/CameraIcon";
import SettingIcon from "@/components/icons/SettingIcon";
import TutorialOverlay from "@/components/tutorial/TutorialOverlay";
import { colors } from "@/constants/colors";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useGalleryTripsQuery } from "@/hooks/queries/gallery/useAllTrips";
import { useTripAlbumQuery } from "@/hooks/queries/gallery/useTripDetail";
import { useCoachMarks } from "@/hooks/useCoachMarks";
import { useCallback, useEffect, useMemo, useState } from "react";

// Album 첫 진입 튜토리얼 (진행 중 여행이 없을 때)
const ALBUM_TUTORIAL_STEPS = [
  {
    key: "startTrip",
    text: "새로운 여행 시작하기 버튼을 눌러 새로운 여행을 생성해요",
  },
  { key: "setting", text: "설정에서 알림을 설정할 수 있어요" },
  { key: "pastTrips", text: "종료된 여행 기록은 여기서 확인할 수 있어요" },
];

// 여행 생성 후 티켓이 만들어졌을 때 튜토리얼
const TICKET_TUTORIAL_STEPS = [
  { key: "shoot", text: "카메라(촬영하기) 버튼을 눌러 사진/영상을 촬영해요" },
  { key: "ticket", text: "티켓을 눌러 일자별 여행 기록을 확인할 수 있어요" },
];

// 세션 내 "다음에 하기"로 닫은 현상 안내 (tripId:rollIndex) — 앱 재시작 시 다시 안내
const dismissedDevelopPrompts = new Set<string>();

export default function Gallery() {
  const router = useRouter();
  const { data, refetch } = useGalleryTripsQuery();

  const activeTripInfo = data?.activeTrip ?? null;
  const hasActive = Boolean(activeTripInfo);
  const completedTrips = data?.completedTrips ?? [];

  const activeTripId = activeTripInfo?.id ?? 0;
  const isLoaded = data !== undefined;

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  // 튜토리얼 — 상황별로 한 번씩만 노출
  const albumTutorial = useCoachMarks(
    "tutorial_album",
    ALBUM_TUTORIAL_STEPS,
    isLoaded && !hasActive,
  );
  const ticketTutorial = useCoachMarks(
    "tutorial_ticket",
    TICKET_TUTORIAL_STEPS,
    isLoaded && hasActive,
  );
  const tutorialVisible = albumTutorial.visible || ticketTutorial.visible;

  // 진행 중 여행의 롤 상태 — 현상 가능한 롤이 생기면 홈에서 안내 모달
  const activeAlbumQuery = useTripAlbumQuery(activeTripId);
  const developableRoll = useMemo(() => {
    const rolls = activeAlbumQuery.data?.result.rolls ?? [];
    // 여러 롤이 밀려 있으면 가장 첫 번째 미현상 롤부터 안내
    return rolls.find((r) => r.developable && !r.developed) ?? null;
  }, [activeAlbumQuery.data]);

  const [developPromptVisible, setDevelopPromptVisible] = useState(false);

  useEffect(() => {
    if (!developableRoll || !activeTripId || tutorialVisible) return;
    const key = `${activeTripId}:${developableRoll.index}`;
    if (dismissedDevelopPrompts.has(key)) return;
    setDevelopPromptVisible(true);
  }, [developableRoll, activeTripId, tutorialVisible]);

  const closeDevelopPrompt = () => {
    if (developableRoll) {
      dismissedDevelopPrompts.add(`${activeTripId}:${developableRoll.index}`);
    }
    setDevelopPromptVisible(false);
  };

  // 현상하러 가기 → 진행 중인 여행 세부페이지 (첫 미현상 롤로 이동)
  const handleGoDevelop = () => {
    if (!developableRoll || !activeTripInfo) return;
    closeDevelopPrompt();
    router.push(
      `/gallery/${activeTripInfo.id}?status=${activeTripInfo.status}&initialRoll=${developableRoll.index}`,
    );
  };

  // 새로운 여행 시작하기 버튼 클릭시
  const handlePressStartTrip = () => {
    router.push("/(tabs)/trip");
  };

  return (
    <View style={styles.page}>
      <Header
        label="Album"
        leftIcon={hasActive ? <CameraIcon /> : null}
        rightIcon={
          <View ref={albumTutorial.targetRef("setting")} collapsable={false}>
            <SettingIcon />
          </View>
        }
        backgroundColor={colors.CLOUD}
        labelColor={colors.NAVY}
      />

      <ScrollView style={styles.container}>
        <Title>진행 중인 여행</Title>

        {hasActive ? (
          activeTripInfo ? (
            <Pressable
              ref={ticketTutorial.targetRef("ticket")}
              onPress={() =>
                router.push(
                  `/gallery/${activeTripInfo.id}?status=${activeTripInfo.status}`,
                )
              }
            >
              <Ticket
                data={activeTripInfo}
                shootButtonRef={ticketTutorial.targetRef("shoot")}
              />
            </Pressable>
          ) : (
            <Text style={styles.explanation}>
              여행 정보를 불러오는 중이에요
            </Text>
          )
        ) : (
          <View style={styles.emptyActiveWrap}>
            <Text style={styles.explanation}>진행 중인 여행이 없어요</Text>
            <Pressable
              ref={albumTutorial.targetRef("startTrip")}
              onPress={handlePressStartTrip}
              style={styles.button}
            >
              <Text style={styles.btnText}>새로운 여행 시작하기</Text>
            </Pressable>
          </View>
        )}

        <View style={{ marginBottom: 61 }} />

        <View
          ref={albumTutorial.targetRef("pastTrips")}
          collapsable={false}
        >
          <Title>지난 여행 기록</Title>

          {completedTrips?.map((trip) => (
            <Pressable
              key={trip.id}
              onPress={() =>
                router.push(`/gallery/${trip.id}?status=${trip.status}`)
              }
            >
              <AlbumCard data={trip} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* 첫 진입 튜토리얼 */}
      <TutorialOverlay
        visible={albumTutorial.visible}
        steps={albumTutorial.steps}
        onFinish={albumTutorial.finish}
      />
      <TutorialOverlay
        visible={ticketTutorial.visible}
        steps={ticketTutorial.steps}
        onFinish={ticketTutorial.finish}
      />

      {/* 현상 가능한 롤 안내 */}
      <DevelopPromptModal
        visible={developPromptVisible}
        onLater={closeDevelopPrompt}
        onGoDevelop={handleGoDevelop}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.CLOUD,
  },
  container: {
    flex: 1,
    padding: 20,
    fontFamily: "Monoplex KR",
  },
  explanation: {
    color: "#000",
    opacity: 0.5,
    fontFamily: "Monoplex KR",
    textAlign: "center",
    fontSize: 16,
    fontWeight: 400,
  },
  emptyActiveWrap: {
    gap: 34,
  },
  button: {
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.NAVY,
    borderRadius: 30,
  },
  btnText: {
    color: colors.CREAM,
    fontSize: 16,
    fontFamily: "Monoplex KR",
    fontWeight: 400,
  },
});
