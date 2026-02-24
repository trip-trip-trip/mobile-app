import { AlbumTitle } from "@/components/gallery/AlbumTitle";
import { DayLabel } from "@/components/gallery/DayLabel";
import { PhotoItem } from "@/components/gallery/PhotoItem";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import { colors } from "@/constants/colors";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
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
  const [selectedMeta, setSelectedMeta] = useState<{
    date: string;
    dayLabel: string;
  } | null>(null);

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
      isTraveling: true,
      title: album?.title ?? "",
      place: "",
      memberProfileUrls: album?.memberProfileUrls ?? [""],
      startDate: album?.startDate ?? "",
      endDate: album?.endDate ?? "",
      shots: mediaData.reduce((acc, d) => acc + d.photos.length, 0),
      video: mediaData.reduce((acc, d) => acc + d.videos.length, 0),
    }),
    [album?.title, album?.startDate, album?.endDate, mediaData]
  );

  const currentDay = mediaData[activeIndex];

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (currentIndex !== activeIndex) setActiveIndex(currentIndex);
  };

  const renderDayPage = ({ item, index }: { item: TripDay; index: number }) => {
    // 일자 - day 1, 2, ..
    const dayNum = index + 1;

    return (
      <View style={styles.dayPage}>
        <DayLabel dayNum={dayNum} date={item.date} />

        <View style={styles.photoGrid}>
          {item.photos.map((photo, index) => {
            const dayLabel = `D${dayNum}-#${String(index + 1).padStart(
              2,
              "0"
            )}`;

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

        <View
          style={{
            flex: 1,
          }}
        >
          {currentDay?.videos.map((video, idx) => (
            <Pressable
              key={video.id}
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
          ))}
        </View>

        <PhotoDetailModal
          visible={Boolean(selected && selectedMeta)}
          onClose={() => {
            setSelected(null);
            setSelectedMeta(null);
          }}
          imageUrl={selected?.url ?? ""}
          date={selectedMeta?.date ?? ""}
          dayLabel={selectedMeta?.dayLabel ?? ""}
          lat={selected?.lat ?? null}
          lng={selected?.lng ?? null}
          comment={selected?.comment ?? null}
          onDownload={() => {
            console.log("download");
          }}
        />
      </ScrollView>
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
  },
  photoItem: {
    width: "50%",
    padding: 0,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
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
