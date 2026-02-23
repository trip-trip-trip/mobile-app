import { AlbumCard } from "@/components/gallery/AlbumCard";
import { Ticket } from "@/components/gallery/Ticket";
import { Title } from "@/components/gallery/Title";
import Header from "@/components/Header";
import CameraIcon from "@/components/icons/CameraIcon";
import SettingIcon from "@/components/icons/SettingIcon";
import { colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useGalleryTripsQuery } from "@/hooks/queries/gallery/useAllTrips";

export default function Gallery() {
  const router = useRouter();

  const { data } = useGalleryTripsQuery();

  const activeTripInfo = data?.activeTrip ?? null;
  const hasActive = Boolean(activeTripInfo);
  const completedTrips = data?.completedTrips ?? [];

  // 새로운 여행 시작하기 버튼 클릭시
  const handlePressStartTrip = () => {
    router.push("/(tabs)/trip");
  };

  return (
    <View style={styles.page}>
      <Header
        label="Album"
        leftIcon={hasActive ? <CameraIcon /> : null}
        rightIcon={<SettingIcon />}
        backgroundColor={colors.CLOUD}
        labelColor={colors.NAVY}
      />

      <ScrollView style={styles.container}>
        <Title>진행 중인 여행</Title>

        {hasActive ? (
          activeTripInfo ? (
            <Pressable
              onPress={() => router.push(`/gallery/${activeTripInfo.id}`)}
            >
              <Ticket data={activeTripInfo} />
            </Pressable>
          ) : (
            <Text style={styles.explanation}>
              여행 정보를 불러오는 중이에요
            </Text>
          )
        ) : (
          <View style={styles.emptyActiveWrap}>
            <Text style={styles.explanation}>진행 중인 여행이 없어요</Text>
            <Pressable onPress={handlePressStartTrip} style={styles.button}>
              <Text style={styles.btnText}>새로운 여행 시작하기</Text>
            </Pressable>
          </View>
        )}

        <View style={{ marginBottom: 61 }} />

        <Title>지난 여행 기록</Title>

        {completedTrips?.map((trip) => (
          <Pressable
            key={trip.id}
            onPress={() => router.push(`/gallery/${trip.id}`)}
          >
            <AlbumCard data={trip} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    width: "100%",
    height: "100%",
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
