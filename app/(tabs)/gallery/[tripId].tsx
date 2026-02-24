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
  StyleSheet,
  View,
} from "react-native";

import { useTripAlbumQuery } from "@/hooks/queries/gallery/useTripDetail";
import type { TripDay } from "@/types/gallery";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Album() {
  const [activeIndex, setActiveIndex] = useState(0);

  const params = useLocalSearchParams<{ tripId?: string }>();

  const tripId = useMemo(() => {
    const raw = params.tripId;
    const parsed = Number(raw);
    if (!raw || Number.isNaN(parsed)) return 0;
    return parsed;
  }, [params.tripId]);

  const albumQuery = useTripAlbumQuery(tripId);
  const mediaData = albumQuery.data ?? [];
  console.log(mediaData);

  console.log("ALBUM STATUS:", albumQuery.status);
  console.log("ALBUM LOADING:", albumQuery.isLoading);
  console.log("ALBUM ERROR:", albumQuery.error);
  console.log("ALBUM RAW DATA:", albumQuery.data);

  // isCompletedTrip(albumQuery.data)

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (currentIndex !== activeIndex) setActiveIndex(currentIndex);
  };

  const renderDayPage = ({ item }: { item: TripDay }) => (
    <View style={styles.dayPage}>
      <DayLabel day={item.dayNumber} date={item.date} />

      <View style={styles.photoGrid}>
        {item.photos.map((photo, index) => (
          <View key={photo.id} style={styles.photoItem}>
            <PhotoItem
              date={item.date}
              day={item.dayNumber}
              num={index + 1}
              location={
                photo.lat != null && photo.lng != null
                  ? `${photo.lat}, ${photo.lng}`
                  : "-"
              }
              url={photo.url}
            />
          </View>
        ))}
      </View>
    </View>
  );

  const albumTitleData = useMemo(() => {
  return {
    id: tripId, 
    title: "우리들의 여행",
    place: "장소 미정",
    startDate: "",
    endDate: "",
    shots: 0,
    video: 0,
  };
}, [tripId]);

  return (
    <View style={styles.safeArea}>
      <Header
        label="Album"
        backgroundColor={colors.CLOUD}
        labelColor={colors.NAVY}
        leftIcon={<GoBackIcon />}
      />

      <AlbumTitle data={albumTitleData} isTraveling={true} />

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
    </View>
  );
}

const styles = StyleSheet.create({
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
