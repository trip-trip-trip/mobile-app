import LockIcon from "@/assets/icons/lock.svg";
import { AlbumTitle } from "@/components/gallery/AlbumTitle";
import { DayLabel } from "@/components/gallery/DayLabel";
import { PhotoItem } from "@/components/gallery/PhotoItem";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import { colors } from "@/constants/colors";
import { useReels } from "@/hooks/queries/gallery/useReels"; // 네가 만든 경로로 맞춰
// 사진 저장 관련 라이브러리
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
// 사진 공유
import * as Sharing from "expo-sharing";

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";

import PhotoDetailModal from "@/components/gallery/PhotoDetailModal";
import { VideoThumbItem } from "@/components/gallery/VideoThumbItem";
import { useTripAlbumQuery } from "@/hooks/queries/gallery/useTripDetail";
import type { DayMedia, DetailMediaItem, TripDay } from "@/types/gallery";
import { getNextDay, getTodayYmd, isCompletedTrip } from "@/utils/date";
import { formatCoordLabelDms } from "@/utils/location";
import { BlurView } from "expo-blur";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Album() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState<DayMedia | null>(null);
  // const selectedKind =
  //   selected?.mediaKind === "VIDEO" || selected?.captureType === "VIDEO"
  //     ? "video"
  //     : "photo";
  const [selectedMeta, setSelectedMeta] = useState<{
    date: string;
    dayLabel: string;
  } | null>(null);

  // 사진 상세 모달
  const [detailItems, setDetailItems] = useState<DetailMediaItem[]>([]);
  const [detailInitialIndex, setDetailInitialIndex] = useState(0);

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

  const endDate = albumTitleData.endDate; // 안전하게 albumTitleData 기준
  const isCompleted = isCompletedTrip(endDate, getTodayYmd());

  const {
    status: reelStatus,
    outputUrl,
    // isPolling,
    // isCreating,
    // retryCreate,
  } = useReels({
    tripId,
    endDate,
    enabled: true, // 여기서 isCompleted 넣지 말고, 훅이 ready로 알아서 collecting 처리하는 게 깔끔함
  });

  const currentDay = mediaData[activeIndex];
  const isTodayCurrentDay = currentDay?.date === getTodayYmd();
  // console.log("VIDEO", currentDay?.videos);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (currentIndex !== activeIndex) setActiveIndex(currentIndex);
  };

  // 네컷 캡처(이미지화)
  const captureFourCut = async () => {
    const ref = shotRefs.current[activeIndex];

    if (!ref) {
      throw new Error("CAPTURE_REF_NOT_FOUND");
    }

    const uri = await ref.capture?.();

    if (!uri) {
      throw new Error("CAPTURE_FAILED");
    }

    return uri;
  };

  // 네컷 다운
  const downloadFourCut = async () => {
    try {
      const uri = await captureFourCut();

      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("권한 없음", "사진 저장 권한이 필요합니다.");
        return;
      }

      await MediaLibrary.saveToLibraryAsync(uri);

      Alert.alert("저장 완료", "네컷 이미지가 앨범에 저장됐어요");
    } catch (e) {
      console.log("download error:", e);
      Alert.alert("저장 실패", "이미지 저장에 실패했습니다.");
    }
  };

  // 네컷 공유
  const shareFourCut = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert("공유 실패", "사진 공유에 실패했습니다.");
        return;
      }

      const uri = await captureFourCut();

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "네컷 이미지 공유",
        UTI: "public.png",
      });
    } catch (e) {
      console.log("share error:", e);
      Alert.alert("공유 실패", "이미지 공유 중 오류가 발생했습니다.");
    }
  };

  // 원본 사진/영상 다운
  const downloadOriginalMedia = async (item?: {
    url: string;
    mediaKind: string;
  }) => {
    try {
      const target = item?.url ? item : selected;
      if (!target?.url) {
        Alert.alert("실패", "저장할 파일이 없어요.");
        return;
      }

      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("권한 필요", "사진/영상 저장 권한이 필요합니다.");
        return;
      }

      const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!baseDir) {
        Alert.alert("실패", "파일 저장 경로를 찾을 수 없어요.");
        return;
      }

      const urlPath = target.url.split("?")[0];
      const fileName = urlPath.split("/").pop() ?? `media_${Date.now()}`;

      const normalizedBase = baseDir.endsWith("/") ? baseDir : baseDir + "/";
      const localUri = normalizedBase + fileName;

      const download = await FileSystem.downloadAsync(target.url, localUri);
      await MediaLibrary.saveToLibraryAsync(download.uri);

      Alert.alert(
        "저장 완료",
        target.mediaKind === "VIDEO"
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
    const isBlur = item.date === getTodayYmd();
    const nextDay = getNextDay(item.date);

    const blockIfToday = () => {
      if (isBlur) {
        Alert.alert("잠금 상태", "오늘 촬영한 사진은 아직 볼 수 없어요.");
        return true;
      }
      return false;
    };

    return (
      <View style={isBlur ? styles.blur : styles.dayPage}>
        <DayLabel
          dayNum={dayNum}
          date={item.date}
          onDownload={() => {
            if (isBlur) {
              Alert.alert(
                "현상 미완료",
                `${nextDay.year}년 ${nextDay.month}월 ${nextDay.day}일에 현상이 완료돼요`
              );
              return;
            }
            downloadFourCut();
          }}
          onShare={() => {
            if (isBlur) {
              Alert.alert(
                "현상 미완료",
                `${nextDay.year}년 ${nextDay.month}월 ${nextDay.day}일에 현상이 완료돼요`
              );
              return;
            }

            shareFourCut();
          }}
        />

        <View style={styles.gridWrapper}>
          <ViewShot
            ref={(r) => {
              shotRefs.current[index] = r;
            }}
            options={{ format: "png", quality: 1 }}
            style={styles.photoGrid}
          >
            {fourPhotos.map((photo, idx) => {
              // const dayLabel = `D${dayNum}-#${String(idx + 1).padStart(
              //   2,
              //   "0"
              // )}`;

              return (
                <View key={photo.id} style={styles.photoItem}>
                  <Pressable
                    onPress={() => {
                      if (blockIfToday()) return;

                      // 그날 사진 전체
                      const dayItems: DetailMediaItem[] = item.photos.map(
                        (p, i) => {
                          const dayLabel = `D${dayNum}-#${String(
                            i + 1
                          ).padStart(2, "0")}`;
                          return {
                            id: p.id,
                            mediaKind: "PHOTO",
                            url: p.url,
                            comment: p.comment,
                            date: item.date,
                            dayLabel,
                            lat: p.lat,
                            lng: p.lng,
                          };
                        }
                      );

                      setDetailItems(dayItems);
                      setDetailInitialIndex(idx); // 지금 누른 사진의 idx

                      setSelected(item.photos[idx]);
                      setSelectedMeta({
                        date: item.date,
                        dayLabel: dayItems[idx].dayLabel,
                      });
                    }}
                  >
                    <PhotoItem
                      date={item.date}
                      day={dayNum}
                      num={idx + 1}
                      location={formatCoordLabelDms(photo.lat, photo.lng)}
                      image={photo.url}
                    />
                  </Pressable>
                </View>
              );
            })}
          </ViewShot>

          {isBlur && (
            <Pressable
              style={styles.lockOverlay}
              onPress={() =>
                Alert.alert(
                  "현상 미완료",
                  `${nextDay.year}년 ${nextDay.month}월 ${nextDay.day}일에 현상이 완료돼요`
                )
              }
            >
              <BlurView
                intensity={40}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: "rgba(255,255,255,0.4)" },
                ]}
              />
              <LockIcon width={76} height={95} />
              <Text
                style={{
                  fontFamily: "Orbit",
                  color: colors.CREAM,
                  backgroundColor: colors.INK,
                  marginTop: 23,
                  textAlign: "center",
                  lineHeight: 16,
                  paddingVertical: 3,
                  paddingHorizontal: 7,
                  fontSize: 14,
                  fontWeight: 400,
                }}
              >
                {nextDay.year}년 {nextDay.month}월 {nextDay.day}일에 현상이
                완료돼요
              </Text>
            </Pressable>
          )}
        </View>
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
        <AlbumTitle data={albumTitleData} isTraveling={!isCompleted} />

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
          {/* 3초 영상 합본 - 완료된 여행일 때만 조회 */}
          {isCompleted && reelStatus === "done" && (
            <View style={styles.videoItem}>
              <Pressable
                onPress={() => {
                  // if (reelStatus === "queued") {
                  //   Alert.alert("영상 생성 중");
                  //   return;
                  // }

                  // done
                  if (!outputUrl) return;
                  const reelItem: DetailMediaItem[] = [
                    {
                      id: -1, // 임시 id
                      mediaKind: "VIDEO",
                      url: outputUrl,
                      comment: null,
                      date: endDate,
                      dayLabel: "REEL",
                      lat: null,
                      lng: null,
                    },
                  ];

                  setDetailItems(reelItem);
                  setDetailInitialIndex(0);
                  setSelected({
                    id: -1,
                    tripId,
                    mediaKind: "VIDEO",
                    captureType: "VIDEO",
                    comment: null,
                    url: outputUrl,
                    uploaderId: 0,
                    width: null,
                    height: null,
                    durationSec: null,
                    takenAt: new Date().toISOString(),
                    lat: null,
                    lng: null,
                  } as any);
                  setSelectedMeta({ date: endDate, dayLabel: "REEL" });
                }}
              >
                <View style={styles.thumbWrap}>
                  {reelStatus === "done" && outputUrl ? (
                    <VideoThumbItem videoUrl={outputUrl} />
                  ) : (
                    <View style={styles.reelPlaceholder} />
                  )}

                  {/* 상태 오버레이 */}
                  {reelStatus === "queued" && (
                    <View style={styles.reelOverlay}>
                      <>
                        <ActivityIndicator />
                        <Text style={styles.reelStatusText}>생성 중..</Text>
                      </>
                    </View>
                  )}
                </View>
              </Pressable>
            </View>
          )}

          {/* 기존 day 영상들 */}
          {currentDay?.videos.map((video, idx) => {
            const nextDay = getNextDay(currentDay.date);
            const onPress = () => {
              if (isTodayCurrentDay) {
                Alert.alert(
                  "현상 미완료",
                  `${nextDay.year}년 ${nextDay.month}월 ${nextDay.day}일에 현상이 완료돼요`
                );
                return;
              }
              const dayItems: DetailMediaItem[] = currentDay.videos.map(
                (v, i) => ({
                  id: v.id,
                  mediaKind: "VIDEO",
                  url: v.url,
                  comment: v.comment,
                  date: currentDay.date,
                  dayLabel: `D${currentDay.dayNumber}-V${String(i + 1).padStart(
                    2,
                    "0"
                  )}`,
                  lat: v.lat,
                  lng: v.lng,
                })
              );

              setDetailItems(dayItems);
              setDetailInitialIndex(idx);
              setSelected(video);
              setSelectedMeta({
                date: currentDay.date,
                dayLabel: dayItems[idx].dayLabel,
              });
            };

            return (
              <View key={video.id} style={styles.videoItem}>
                <Pressable onPress={onPress}>
                  <View style={styles.thumbWrap}>
                    <VideoThumbItem videoUrl={video.url} />
                    {isTodayCurrentDay && (
                      <View style={styles.blurOverlay}>
                        <BlurView
                          intensity={40}
                          tint="light"
                          style={StyleSheet.absoluteFill}
                        />
                        <View
                          style={[
                            StyleSheet.absoluteFill,
                            { backgroundColor: "rgba(255,255,255,0.35)" },
                          ]}
                        />
                        <LockIcon width={50} height={69} />
                      </View>
                    )}
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
      {/* 사진/영상 세부 페이지 */}
      <PhotoDetailModal
        visible={Boolean(selected && selectedMeta)}
        onClose={() => {
          setSelected(null);
          setSelectedMeta(null);
          setDetailItems([]);
          setDetailInitialIndex(0);
        }}
        items={detailItems}
        initialIndex={detailInitialIndex}
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
  },
  blur: {
    width: SCREEN_WIDTH,
    backgroundColor: colors.CLOUD,
    opacity: 0.9,
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
  gridWrapper: {
    position: "relative",
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbWrap: {
    position: "relative",
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
  reelOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  reelPlaceholder: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.INK,
  },
  reelStatusText: {
    marginTop: 10,
    fontFamily: "Orbit",
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 999,
    color: colors.INK,
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
