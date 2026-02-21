import { AlbumTitle } from "@/components/gallery/AlbumTitle";
import { DayLabel } from "@/components/gallery/DayLabel";
import { PhotoItem } from "@/components/gallery/PhotoItem";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import { colors } from "@/constants/colors";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ALBUM_DATA = [
  {
    id: "1",
    day: 1,
    date: "FEB 05, 2026",
    photos: [1, 2, 3, 4],
    location: "37∘33′59.4′′N,126∘58′40.8′′E",
  },
  {
    id: "2",
    day: 2,
    date: "FEB 06, 2026",
    photos: [5, 6],
    location: "37∘33′59.4′′N,126∘58′40.8′′E",
  },
  {
    id: "3",
    day: 3,
    date: "FEB 07, 2026",
    photos: [7, 8, 9],
    location: "37∘33′59.4′′N,126∘58′40.8′′E",
  },
];

const TRIP_INFO = {
  isTraveling: true,
  title: "굉장히 신나는 여행",
  place: "제주도",
  startDate: "FEB 05",
  endDate: "FEB 07",
  shots: 4,
  video: 2,
};

export default function Album() {
  const [activeIndex, setActiveIndex] = useState(0);

  // 스크롤 시 현재 인덱스 계산
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (currentIndex !== activeIndex) {
      setActiveIndex(currentIndex);
    }
  };

  const renderDayPage = ({ item }: { item: (typeof ALBUM_DATA)[0] }) => (
    <View style={styles.dayPage}>
      {/* item.day와 item.date를 사용하여 동적으로 표시 */}
      <DayLabel day={item.day} date={item.date} />

      <View style={styles.photoGrid}>
        {item.photos.map((photo, index) => (
          <View key={index} style={styles.photoItem}>
            <PhotoItem
              date={item.date}
              day={item.day} // 현재 Day 번호 전달
              num={index + 1} // 사진 번호
              location={item.location}
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

      <AlbumTitle data={TRIP_INFO} />

      <View style={styles.sectionSeparator} />

      <FlatList
        data={ALBUM_DATA}
        renderItem={renderDayPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll} // 스크롤 이벤트 감지
        scrollEventThrottle={16}
      />

      {/* 하단 페이지 인디케이터 (네모 아이콘들) */}
      <View style={styles.indicatorContainer}>
        {ALBUM_DATA.map((_, index) => (
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
  // 인디케이터 스타일
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
