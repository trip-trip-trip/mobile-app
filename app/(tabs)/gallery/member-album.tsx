import DefaultProfile from "@/assets/icons/default_profile.svg";
import { DayLabel } from "@/components/gallery/DayLabel";
import PhotoDetailModal from "@/components/gallery/PhotoDetailModal";
import { PhotoItem } from "@/components/gallery/PhotoItem";
import { Title } from "@/components/gallery/Title";
import { VideoThumbItem } from "@/components/gallery/VideoThumbItem";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import { colors } from "@/constants/colors";
import { useMemberAlbumQuery } from "@/hooks/queries/gallery/useMemberAlbum";
import type { DetailMediaItem, TripRoll } from "@/types/gallery";
import { formatDateRangeToEnglish } from "@/utils/date";
import { formatCoordLabelDms } from "@/utils/location";
import { rollDateLabel } from "@/utils/roll";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
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

  // 서버가 친구의 "현상된" 미디어만 내려주므로(Q9) 잠금 UI 없이 콘텐츠 있는 롤만 표시
  const mediaData = useMemo(
    () =>
      (album?.rolls ?? []).filter(
        (r) => r.photos.length > 0 || r.videos.length > 0,
      ),
    [album?.rolls],
  );

  const currentRoll = mediaData[activeIndex];

  useEffect(() => {
    if (mediaData.length > 0 && activeIndex >= mediaData.length) {
      setActiveIndex(mediaData.length - 1);
    }
  }, [mediaData.length, activeIndex]);

  const totalShots = mediaData.reduce((acc, r) => acc + r.photos.length, 0);
  const totalVideos = mediaData.reduce((acc, r) => acc + r.videos.length, 0);

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

  // 내 앨범과 동일한 네컷 레이아웃 — 현상된 롤만 오므로 잠금/현상 버튼 없음
  const renderRollPage = ({ item }: { item: TripRoll; index: number }) => {
    const rollNum = item.index;
    const fourPhotos = item.photos.slice(0, 4);
    const dateLabel = rollDateLabel(item);

    return (
      <View style={styles.dayPage}>
        <DayLabel dayNum={rollNum} date={dateLabel} showActions={false} />

        <View style={styles.photoGrid}>
          {fourPhotos.map((photo, idx) => (
            <View key={photo.id} style={styles.photoItem}>
              <Pressable
                onPress={() => {
                  const rollItems: DetailMediaItem[] = item.photos.map(
                    (p, i) => ({
                      id: p.id,
                      mediaKind: "PHOTO",
                      url: p.url,
                      comment: p.comment,
                      date: dateLabel,
                      dayLabel: `D${rollNum}-#${String(i + 1).padStart(2, "0")}`,
                      lat: p.lat,
                      lng: p.lng,
                    }),
                  );
                  openDetail(rollItems, idx);
                }}
              >
                <PhotoItem
                  date={dateLabel}
                  day={rollNum}
                  num={idx + 1}
                  location={formatCoordLabelDms(photo.lat, photo.lng)}
                  image={photo.url}
                />
              </Pressable>
            </View>
          ))}
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
            친구가 현상을 마친 네컷과 영상만 볼 수 있어요
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
            친구가 아직 현상한 기록이 없어요.
          </Text>
        ) : (
          <>
            <FlatList
              data={mediaData}
              renderItem={renderRollPage}
              keyExtractor={(item) => String(item.index)}
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
              {currentRoll?.videos.map((video, idx) => {
                const rollLabel = rollDateLabel(currentRoll);
                const onPress = () => {
                  const rollItems: DetailMediaItem[] = currentRoll.videos.map(
                    (v, i) => ({
                      id: v.id,
                      mediaKind: "VIDEO",
                      url: v.url,
                      comment: v.comment,
                      date: rollLabel,
                      dayLabel: `D${currentRoll.index}-V${String(
                        i + 1,
                      ).padStart(2, "0")}`,
                      lat: v.lat,
                      lng: v.lng,
                    }),
                  );
                  openDetail(rollItems, idx);
                };

                return (
                  <View key={video.id} style={styles.videoItem}>
                    <Pressable onPress={onPress}>
                      <VideoThumbItem videoUrl={video.url} />
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
  emptyText: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 13,
    color: colors.NAVY,
    textAlign: "center",
    marginTop: 60,
    paddingBottom: 100,
  },
});
