import DefaultProfile from "@/assets/icons/default_profile.svg";
import LockIcon from "@/assets/icons/lock.svg";
import { DayLabel } from "@/components/gallery/DayLabel";
import PhotoDetailModal from "@/components/gallery/PhotoDetailModal";
import { PhotoItem } from "@/components/gallery/PhotoItem";
import { Title } from "@/components/gallery/Title";
import { VideoThumbItem } from "@/components/gallery/VideoThumbItem";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import { colors } from "@/constants/colors";
import { useMemberAlbumQuery } from "@/hooks/queries/gallery/useMemberAlbum";
import type { DetailMediaItem, TripDay } from "@/types/gallery";
import {
  formatDateRangeToEnglish,
  getNextDay,
  getTodayYmd,
} from "@/utils/date";
import { formatCoordLabelDms } from "@/utils/location";
import { BlurView } from "expo-blur";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function MemberAlbum() {
  const params = useLocalSearchParams<{
    tripId?: string;
    memberId?: string;
    memberUserId?: string;
    memberAvatarUrl?: string;
    title?: string;
  }>();

  const tripId = useMemo(() => {
    const parsed = Number(params.tripId);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [params.tripId]);

  const memberId = useMemo(() => {
    const parsed = Number(params.memberId);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [params.memberId]);

  const memberName = params.memberUserId ?? "";
  const memberAvatarUrl = params.memberAvatarUrl || null;

  const [activeIndex, setActiveIndex] = useState(0);
  const [detailItems, setDetailItems] = useState<DetailMediaItem[]>([]);
  const [detailInitialIndex, setDetailInitialIndex] = useState(0);
  const [detailVisible, setDetailVisible] = useState(false);

  const albumQuery = useMemberAlbumQuery(tripId, memberId);
  const album = albumQuery.data?.result;
  const mediaData = album?.days ?? [];

  const currentDay = mediaData[activeIndex];
  // 오늘 촬영분은 여행 종료 여부와 무관하게 다음날 0시에 공개 (마지막 날 포함)
  const isTodayCurrentDay = currentDay?.date === getTodayYmd();

  const totalShots = mediaData.reduce((acc, d) => acc + d.photos.length, 0);
  const totalVideos = mediaData.reduce((acc, d) => acc + d.videos.length, 0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (currentIndex !== activeIndex) setActiveIndex(currentIndex);
  };

  const openDetail = (items: DetailMediaItem[], index: number) => {
    setDetailItems(items);
    setDetailInitialIndex(index);
    setDetailVisible(true);
  };

  // 내 앨범(renderDayPage)과 동일한 네컷 레이아웃 — 다운로드/공유 및 캡처만 제외
  const renderDayPage = ({ item, index }: { item: TripDay; index: number }) => {
    const dayNum = index + 1;
    const fourPhotos = item.photos.slice(0, 4);
    const isBlur = item.date === getTodayYmd();
    const nextDay = getNextDay(item.date);

    const alertNotDeveloped = () =>
      Alert.alert(
        "현상 미완료",
        `${nextDay.year}년 ${nextDay.month}월 ${nextDay.day}일에 현상이 완료돼요`,
      );

    return (
      <View style={isBlur ? styles.blur : styles.dayPage}>
        <DayLabel dayNum={dayNum} date={item.date} showActions={false} />

        <View style={styles.gridWrapper}>
          <View style={styles.photoGrid}>
            {fourPhotos.map((photo, idx) => (
              <View key={photo.id} style={styles.photoItem}>
                <Pressable
                  onPress={() => {
                    if (isBlur) {
                      Alert.alert(
                        "잠금 상태",
                        "오늘 촬영한 사진은 아직 볼 수 없어요.",
                      );
                      return;
                    }
                    const dayItems: DetailMediaItem[] = item.photos.map(
                      (p, i) => ({
                        id: p.id,
                        mediaKind: "PHOTO",
                        url: p.url,
                        comment: p.comment,
                        date: item.date,
                        dayLabel: `D${dayNum}-#${String(i + 1).padStart(2, "0")}`,
                        lat: p.lat,
                        lng: p.lng,
                      }),
                    );
                    openDetail(dayItems, idx);
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
            ))}
          </View>

          {isBlur && (
            <Pressable style={styles.lockOverlay} onPress={alertNotDeveloped}>
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
              <Text style={styles.lockText}>
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
        label={memberName ? `@${memberName}` : "Album"}
        backgroundColor={colors.CLOUD}
        labelColor={colors.NAVY}
        leftIcon={<GoBackIcon />}
      />

      {/* 친구 앨범임을 명확히 표시하는 배너 */}
      <View style={styles.friendBanner}>
        <View style={styles.friendAvatarWrapper}>
          {memberAvatarUrl ? (
            <Image
              source={{ uri: memberAvatarUrl }}
              style={styles.friendAvatar}
            />
          ) : (
            <DefaultProfile width={34} height={34} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.friendBannerTitle}>
            @{memberName} 님의 앨범을 보고 있어요
          </Text>
          <Text style={styles.friendBannerSub}>
            함께한 여행에서 친구가 남긴 네컷과 영상이에요
          </Text>
        </View>
      </View>

      <ScrollView style={styles.safeArea}>
        <View style={styles.topSection}>
          <Title>{album?.title ?? params.title ?? ""}</Title>
          <Text style={styles.locationDateText}>
            {formatDateRangeToEnglish(album?.startDate, album?.endDate)}
          </Text>
          <Text style={styles.countText}>
            <Text style={{ color: "#FF5252" }}>{totalShots} SHOTS</Text> •{" "}
            {totalVideos} VIDEOS
          </Text>
        </View>

        <View style={styles.sectionSeparator} />

        {mediaData.length === 0 && !albumQuery.isLoading ? (
          <Text style={styles.emptyText}>
            아직 친구가 남긴 기록이 없어요.
          </Text>
        ) : (
          <>
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
                      dayLabel: `D${currentDay.dayNumber}-V${String(
                        i + 1,
                      ).padStart(2, "0")}`,
                      lat: v.lat,
                      lng: v.lng,
                    }),
                  );
                  openDetail(dayItems, idx);
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
          </>
        )}
      </ScrollView>

      {/* 사진/영상 세부 페이지 — 친구 미디어는 다운로드 미제공 */}
      <PhotoDetailModal
        visible={detailVisible}
        onClose={() => {
          setDetailVisible(false);
          setDetailItems([]);
          setDetailInitialIndex(0);
        }}
        items={detailItems}
        initialIndex={detailInitialIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.CLOUD,
  },
  friendBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.NAVY,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  friendAvatarWrapper: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.CLOUD,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.CREAM,
  },
  friendAvatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  friendBannerTitle: {
    fontFamily: "MonoplexKR-SemiBold",
    fontSize: 13,
    color: colors.CLOUD,
  },
  friendBannerSub: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 11,
    color: colors.CREAM,
    opacity: 0.8,
    marginTop: 1,
  },
  topSection: {
    padding: 20,
    paddingBottom: 10,
  },
  locationDateText: {
    fontSize: 14,
    color: colors.NAVY,
    fontFamily: "MonoplexKR-Regular",
    marginBottom: 5,
  },
  countText: {
    fontSize: 12,
    color: colors.NAVY,
    fontFamily: "MonoplexKR-Bold",
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
  lockText: {
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
  emptyText: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 13,
    color: colors.NAVY,
    textAlign: "center",
    marginTop: 60,
    paddingBottom: 100,
  },
});
