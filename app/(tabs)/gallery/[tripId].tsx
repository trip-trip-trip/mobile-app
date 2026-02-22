import { AlbumTitle } from "@/components/gallery/AlbumTitle";
import { DayLabel } from "@/components/gallery/DayLabel";
import { PhotoItem } from "@/components/gallery/PhotoItem";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import { colors } from "@/constants/colors";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TRIP_INFO = {
  isTraveling: true,
  title: "굉장히 신나는 여행",
  place: "제주도",
  startDate: "FEB 05",
  endDate: "FEB 07",
  shots: 4,
  video: 2,
};

type MediaKind = "PHOTO" | "VIDEO";

type DayMedia = {
  id: number;
  tripId: number;
  mediaKind: MediaKind;
  captureType: string;
  comment: string | null;
  url: string;
  uploaderId: number;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  takenAt: string;
  lat: number | null;
  lng: number | null;
};

type TripDay = {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  photos: DayMedia[];
  videos: DayMedia[];
};

type TripDetailResponse = {
  isSuccess: boolean;
  code: number;
  message: string;
  result: { tripId: number; days: TripDay[] };
};

type TripStatus = "active" | "completed";

export default function Album() {
  const [activeIndex, setActiveIndex] = useState(0);

  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  const todayDate = new Date().toISOString().split("T")[0];
  const [tripStatus, setTripStatus] = useState<TripStatus>("active");

  const [mediaData, setMediaData] = useState<TripDay[]>([]);

  // 스크롤 시 현재 인덱스 계산
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (currentIndex !== activeIndex) setActiveIndex(currentIndex);
  };

  // 테스트용
  useEffect(() => {
    setMediaData(MOCK_MEDIA_DATA);
    // fetchTripDetail().catch(console.error);
  }, []);

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
              // url={photo.url}
            />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <Header
        label="Album"
        backgroundColor={colors.CLOUD}
        labelColor={colors.NAVY}
        leftIcon={<GoBackIcon />}
      />

      <AlbumTitle data={TRIP_INFO} isTraveling={true} />

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

// 더미
export const MOCK_MEDIA_DATA: TripDay[] = [
  {
    dayNumber: 19,
    date: "2026-02-19",
    photos: [
      {
        id: 1,
        tripId: 1,
        mediaKind: "PHOTO",
        captureType: "PHOTO",
        comment: "첫날 사진",
        url: "https://picsum.photos/600/600?random=1",
        uploaderId: 1,
        width: 1080,
        height: 1080,
        durationSec: null,
        takenAt: "2026-02-19T10:04:59",
        lat: 33.4996,
        lng: 126.5312,
      },
      {
        id: 2,
        tripId: 1,
        mediaKind: "PHOTO",
        captureType: "PHOTO",
        comment: "카페에서",
        url: "https://picsum.photos/600/600?random=2",
        uploaderId: 1,
        width: 1080,
        height: 1080,
        durationSec: null,
        takenAt: "2026-02-19T12:00:00",
        lat: 33.5,
        lng: 126.53,
      },
    ],
    videos: [
      {
        id: 3,
        tripId: 1,
        mediaKind: "VIDEO",
        captureType: "VIDEO",
        comment: "바다 영상",
        url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
        uploaderId: 1,
        width: null,
        height: null,
        durationSec: 12,
        takenAt: "2026-02-19T15:05:25",
        lat: 33.499,
        lng: 126.532,
      },
    ],
  },
  {
    dayNumber: 20,
    date: "2026-02-20",
    photos: [
      {
        id: 4,
        tripId: 1,
        mediaKind: "PHOTO",
        captureType: "PHOTO",
        comment: "둘째날 아침",
        url: "https://picsum.photos/600/600?random=3",
        uploaderId: 1,
        width: 1080,
        height: 1080,
        durationSec: null,
        takenAt: "2026-02-20T09:10:00",
        lat: 33.51,
        lng: 126.54,
      },
    ],
    videos: [
      {
        id: 5,
        tripId: 1,
        mediaKind: "VIDEO",
        captureType: "VIDEO",
        comment: "카메라 테스트",
        url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
        uploaderId: 1,
        width: null,
        height: null,
        durationSec: 8,
        takenAt: "2026-02-20T18:00:00",
        lat: 33.52,
        lng: 126.55,
      },
      {
        id: 6,
        tripId: 1,
        mediaKind: "VIDEO",
        captureType: "VIDEO",
        comment: "야경",
        url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
        uploaderId: 1,
        width: null,
        height: null,
        durationSec: 15,
        takenAt: "2026-02-20T20:30:00",
        lat: 33.53,
        lng: 126.56,
      },
    ],
  },
  {
    dayNumber: 21,
    date: "2026-02-21",
    photos: [],
    videos: [
      {
        id: 7,
        tripId: 1,
        mediaKind: "VIDEO",
        captureType: "VIDEO",
        comment: "마지막날 영상",
        url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
        uploaderId: 1,
        width: null,
        height: null,
        durationSec: 20,
        takenAt: "2026-02-21T12:00:00",
        lat: 33.54,
        lng: 126.57,
      },
    ],
  },
];
