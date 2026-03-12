import LockIcon from "@/assets/icons/lock.svg";
import { AlbumTitle } from "@/components/gallery/AlbumTitle";
import { DayLabel } from "@/components/gallery/DayLabel";
import { PhotoItem } from "@/components/gallery/PhotoItem";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import { colors } from "@/constants/colors";
import { useReels } from "@/hooks/queries/gallery/useReels";
import { useDeleteTrip, useUpdateTrip } from "@/hooks/queries/useTripMutation";
// 사진 저장 관련 라이브러리
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
// 사진 공유
import * as Sharing from "expo-sharing";

import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
import { endTrip } from "@/api/trip";
import queryClient from "@/api/queryClient";
import { tripKeys } from "@/hooks/queries/gallery/tripKeys";
import { albumKeys } from "@/hooks/queries/gallery/albumKeys";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Album() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState<DayMedia | null>(null);
  const [selectedMeta, setSelectedMeta] = useState<{
    date: string;
    dayLabel: string;
  } | null>(null);

  // 사진 상세 모달
  const [detailItems, setDetailItems] = useState<DetailMediaItem[]>([]);
  const [detailInitialIndex, setDetailInitialIndex] = useState(0);

  // 여행 수정 모달
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  // 여행 종료 로딩
  const [isEndingTrip, setIsEndingTrip] = useState(false);

  const shotRefs = useRef<Record<number, any>>({});

  const params = useLocalSearchParams<{ tripId?: string; status?: string }>();

  const tripId = useMemo(() => {
    const raw = params.tripId;
    const parsed = Number(raw);
    if (!raw || Number.isNaN(parsed)) return 0;
    return parsed;
  }, [params.tripId]);

  const albumQuery = useTripAlbumQuery(tripId);
  const updateTrip = useUpdateTrip(tripId);
  const deleteTrip = useDeleteTrip();

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
    [tripId, album?.title, album?.startDate, album?.endDate, mediaData],
  );

  const endDate = albumTitleData.endDate;
  // 종료 버튼 표시: status 기준 (날짜가 아닌 실제 완료 여부)
  const tripStatus = params.status;
  const canEndTrip = tripStatus !== "COMPLETED";
  // 릴 표시 조건: 날짜 기준 유지 (endDate <= today 이면 릴 조회 가능)
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

  // 여행 이름 수정 모달 열기
  const handleOpenEditModal = () => {
    setEditTitle(album?.title ?? "");
    setEditModalVisible(true);
  };

  // 여행 이름 저장
  const handleSaveTitle = async () => {
    const trimmed = editTitle.trim();
    if (!trimmed) {
      Alert.alert("알림", "여행 이름을 입력해주세요.");
      return;
    }
    try {
      await updateTrip.mutateAsync({ title: trimmed });
      setEditModalVisible(false);
      Alert.alert("완료", "여행 이름이 수정됐습니다.");
    } catch (error) {
      console.error("[Trip update error]", error);
      Alert.alert("오류", "수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 여행 삭제
  const handleDeleteTrip = () => {
    Alert.alert(
      "여행 삭제",
      "이 여행을 삭제하면 모든 사진과 영상이 함께 삭제됩니다.\n계속하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTrip.mutateAsync(tripId);
            } catch (error) {
              console.error("[Trip delete error]", error);
              Alert.alert("오류", "삭제에 실패했습니다. 다시 시도해주세요.");
            }
          },
        },
      ],
    );
  };

  // 여행 수동 종료
  const handleEndTrip = () => {
    Alert.alert(
      "여행 종료",
      "지금 여행을 종료하면 사진 현상이 시작됩니다.\n계속하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "종료",
          onPress: async () => {
            setIsEndingTrip(true);
            try {
              await endTrip(tripId);
              await queryClient.invalidateQueries({ queryKey: tripKeys.all });
              await queryClient.invalidateQueries({
                queryKey: albumKeys.detail(tripId),
              });
              router.replace({
                pathname: "/(tabs)/gallery/developing" as any,
                params: { tripId: String(tripId) },
              });
            } catch (error) {
              console.error("[End trip error]", error);
              setIsEndingTrip(false);
              Alert.alert(
                "오류",
                "여행 종료에 실패했습니다. 다시 시도해주세요.",
              );
            }
          },
        },
      ],
    );
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
          : "사진 저장이 완료됐습니다.",
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
                `${nextDay.year}년 ${nextDay.month}월 ${nextDay.day}일에 현상이 완료돼요`,
              );
              return;
            }
            downloadFourCut();
          }}
          onShare={() => {
            if (isBlur) {
              Alert.alert(
                "현상 미완료",
                `${nextDay.year}년 ${nextDay.month}월 ${nextDay.day}일에 현상이 완료돼요`,
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
                            i + 1,
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
                        },
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
                  `${nextDay.year}년 ${nextDay.month}월 ${nextDay.day}일에 현상이 완료돼요`,
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
        <AlbumTitle data={albumTitleData} isTraveling={canEndTrip} />

        {/* 여행 액션 버튼 행 (수정 / 삭제 / 종료) */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={handleOpenEditModal}
            hitSlop={8}
            style={styles.actionIconBtn}
          >
            <Feather name="edit-2" size={16} color={colors.NAVY} />
          </Pressable>
          {canEndTrip && (
            <Pressable
              onPress={handleEndTrip}
              disabled={isEndingTrip}
              style={[
                styles.actionBtn,
                styles.endBtn,
                isEndingTrip && { opacity: 0.5 },
              ]}
            >
              <Text style={[styles.actionBtnText]}>
                {isEndingTrip ? "종료 중..." : "여행 종료"}
              </Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={handleDeleteTrip}
            hitSlop={8}
            style={[styles.actionIconBtn, styles.deleteBtn]}
            disabled={deleteTrip.isPending}
          >
            <Feather name="trash-2" size={16} color="#ea4335" />
          </Pressable>
        </View>

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
                  `${nextDay.year}년 ${nextDay.month}월 ${nextDay.day}일에 현상이 완료돼요`,
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
                    "0",
                  )}`,
                  lat: v.lat,
                  lng: v.lng,
                }),
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
      {/* 여행 이름 수정 모달 */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>여행 이름 수정</Text>
            <TextInput
              style={styles.modalInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="여행 이름을 입력해주세요"
              placeholderTextColor={colors.NAVY + "80"}
              autoFocus
              maxLength={30}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  updateTrip.isPending && { opacity: 0.5 },
                ]}
                onPress={handleSaveTitle}
                disabled={updateTrip.isPending}
              >
                <Text style={styles.modalSaveText}>
                  {updateTrip.isPending ? "저장 중..." : "저장"}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
  actionRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.NAVY + "40",
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  endBtn: {
    height: 34,
    paddingVertical: 0,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: colors.NAVY,
    borderColor: colors.NAVY,
  },
  deleteBtn: {
    borderColor: "#ea4335",
  },
  actionBtnText: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 12,
    color: colors.NAVY,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "80%",
    backgroundColor: colors.CLOUD,
    borderRadius: 12,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontFamily: "MonoplexKR-Bold",
    fontSize: 16,
    color: colors.INK,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.NAVY,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "MonoplexKR-Regular",
    fontSize: 14,
    color: colors.INK,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.NAVY,
    alignItems: "center",
  },
  modalCancelText: {
    fontFamily: "MonoplexKR-Medium",
    fontSize: 14,
    color: colors.NAVY,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.NAVY,
    alignItems: "center",
  },
  modalSaveText: {
    fontFamily: "MonoplexKR-Medium",
    fontSize: 14,
    color: colors.CREAM,
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
