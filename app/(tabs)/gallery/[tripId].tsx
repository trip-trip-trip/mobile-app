import { AlbumTitle } from "@/components/gallery/AlbumTitle";
import { DayLabel } from "@/components/gallery/DayLabel";
import { PhotoItem } from "@/components/gallery/PhotoItem";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import { colors } from "@/constants/colors";
// 사진 저장 관련 라이브러리
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import ViewShot from "react-native-view-shot";

import {
  Alert,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import PhotoDetailModal from "@/components/gallery/PhotoDetailModal";
import { VideoThumbItem } from "@/components/gallery/VideoThumbItem";
import { useTripAlbumQuery } from "@/hooks/queries/gallery/useTripDetail";
import type { DayMedia, TripDay } from "@/types/gallery";
import { getTodayYmd, isCompletedTrip } from "@/utils/date";
import { formatCoordLabelDms } from "@/utils/location";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Album() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState<DayMedia | null>(null);
  const selectedKind =
    selected?.mediaKind === "VIDEO" || selected?.captureType === "VIDEO"
      ? "video"
      : "photo";
  console.log("미디어종류", selectedKind);
  const [selectedMeta, setSelectedMeta] = useState<{
    date: string;
    dayLabel: string;
  } | null>(null);

  const shotRefs = useRef<Record<number, any>>({});

  const params = useLocalSearchParams<{ tripId?: string }>();

  const tripId = useMemo(() => {
    const raw = params.tripId;
    const parsed = Number(raw);
    if (!raw || Number.isNaN(parsed)) return 0;
    return parsed;
  }, [params.tripId]);

  const albumQuery = useTripAlbumQuery(tripId);

  const album = albumQuery.data?.result;
  const mediaData = album?.days ?? [];

  const albumTitleData = useMemo(
    () => ({
      id: tripId,
      isTraveling: true,
      title: album?.title ?? "",
      place: "",
      memberProfileUrls: album?.memberProfileUrls ?? [""],
      startDate: album?.startDate ?? "",
      endDate: album?.endDate ?? "",
      shots: mediaData.reduce((acc, d) => acc + d.photos.length, 0),
      video: mediaData.reduce((acc, d) => acc + d.videos.length, 0),
    }),
    [tripId, album?.title, album?.startDate, album?.endDate, mediaData]
  );

  const currentDay = mediaData[activeIndex];
  console.log("VIDEO", currentDay?.videos);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (currentIndex !== activeIndex) setActiveIndex(currentIndex);
  };

  // 네컷 다운
  const downloadFourCut = async () => {
    try {
      const ref = shotRefs.current[activeIndex];
      if (!ref) {
        Alert.alert("실패", "저장할 이미지를 찾을 수 없어요.");
        return;
      }

      // 권한 요청
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("권한 필요", "사진 저장 권한이 필요합니다.");
        return;
      }

      // 캡처
      const uri = await ref.capture?.();
      if (!uri) {
        Alert.alert("실패", "이미지 저장 중 오류가 발생했습니다.");
        return;
      }

      // 저장
      await MediaLibrary.saveToLibraryAsync(uri);

      // 저장 성공
      Alert.alert("저장 완료", "네컷 이미지가 앨범에 저장됐어요");
    } catch (e) {
      console.log("download error:", e);

      // 저장 실패
      Alert.alert("저장 실패", "이미지 저장에 실패했습니다.");
    }
  };

  // 원본 사진/영상 다운
  const downloadOriginalMedia = async () => {
    try {
      if (!selected?.url) {
        Alert.alert("실패", "저장할 파일이 없어요.");
        return;
      }

      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("권한 필요", "사진/영상 저장 권한이 필요합니다.");
        return;
      }

      // 저장경로
      const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!baseDir) {
        Alert.alert("실패", "파일 저장 경로를 찾을 수 없어요.");
        return;
      }

      // 파일명 만들기
      const urlPath = selected.url.split("?")[0];
      const fileName = urlPath.split("/").pop() ?? `media_${Date.now()}`;

      // baseDir 끝에 / 보장
      const normalizedBase = baseDir.endsWith("/") ? baseDir : baseDir + "/";
      const localUri = normalizedBase + fileName;

      const download = await FileSystem.downloadAsync(selected.url, localUri);

      await MediaLibrary.saveToLibraryAsync(download.uri);

      Alert.alert(
        "저장 완료",
        selected.mediaKind === "VIDEO"
          ? "영상 저장이 완료됐습니다."
          : "사진 저장이 완료됐습니다."
      );
    } catch (e) {
      console.log("downloadOriginalMedia error:", e);
      Alert.alert("저장 실패", "파일 저장 중 오류가 발생했어요.");
    }
  };

  const renderDayPage = ({ item, index }: { item: TripDay; index: number }) => {
    // 일자 - day 1, 2, ..
    const dayNum = index + 1;
    const fourPhotos = item.photos.slice(0, 4); // 네컷 캡처

    return (
      <View style={styles.dayPage}>
        <DayLabel
          dayNum={dayNum}
          date={item.date}
          onDownload={downloadFourCut}
        />

        <ViewShot
          ref={(r) => {
            shotRefs.current[index] = r;
          }}
          options={{ format: "png", quality: 1 }}
          style={styles.photoGrid}
        >
          {fourPhotos.map((photo, idx) => {
            const dayLabel = `D${dayNum}-#${String(idx + 1).padStart(2, "0")}`;

            return (
              <View key={photo.id} style={styles.photoItem}>
                <Pressable
                  onPress={() => {
                    setSelected(photo);
                    setSelectedMeta({ date: item.date, dayLabel });
                  }}
                >
                  <PhotoItem
                    date={item.date}
                    day={dayNum}
                    num={index + 1}
                    location={formatCoordLabelDms(photo.lat, photo.lng)}
                    image={photo.url}
                  />
                </Pressable>
              </View>
            );
          })}
        </ViewShot>
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <Header
        label="Album"
        backgroundColor={colors.CLOUD}
        labelColor={colors.NAVY}
        leftIcon={<GoBackIcon />}
      />
      <ScrollView style={styles.safeArea}>
        <AlbumTitle
          data={albumTitleData}
          isTraveling={!isCompletedTrip(albumTitleData.endDate, getTodayYmd())}
        />

        <View style={styles.sectionSeparator} />

        <FlatList
          data={mediaData}
          renderItem={renderDayPage}
          keyExtractor={(item) => String(item.dayNumber)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        />

        <View style={styles.indicatorContainer}>
          {mediaData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicatorSquare,
                activeIndex === index
                  ? styles.activeIndicator
                  : styles.inactiveIndicator,
              ]}
            />
          ))}
        </View>

        <View style={styles.videoGrid}>
          {currentDay?.videos.map((video, idx) => (
            <View key={video.id} style={styles.videoItem}>
              <Pressable
                onPress={() => {
                  setSelected(video);
                  setSelectedMeta({
                    date: currentDay.date,
                    dayLabel: `D${currentDay.dayNumber}-V${String(
                      idx + 1
                    ).padStart(2, "0")}`,
                  });
                }}
              >
                <VideoThumbItem videoUrl={video.url} />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
      {/* 사진/영상 세부 페이지 */}
      <PhotoDetailModal
        visible={Boolean(selected && selectedMeta)}
        onClose={() => {
          setSelected(null);
          setSelectedMeta(null);
        }}
        mediaKind={selectedKind}
        mediaUrl={selected?.url ?? ""}
        date={selectedMeta?.date ?? ""}
        dayLabel={selectedMeta?.dayLabel ?? ""}
        lat={selected?.lat ?? null}
        lng={selected?.lng ?? null}
        comment={selected?.comment ?? null}
        onDownload={downloadOriginalMedia}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    fontFamily: "Monoplex KR",
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.CLOUD,
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: colors.NAVY,
    opacity: 0.3,
  },
  dayPage: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    backgroundColor: colors.CLOUD,
  },
  photoItem: {
    width: "50%",
    padding: 0,
  },
  videoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  videoItem: {
    width: "50%",
    padding: 2,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: colors.CLOUD,
  },
  indicatorSquare: {
    width: 12,
    height: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.NAVY,
  },
  activeIndicator: {
    backgroundColor: colors.NAVY,
  },
  inactiveIndicator: {
    backgroundColor: "transparent",
  },
});
