import CityItem from "@/components/CityItem";
import FilterTab from "@/components/FilterTab";
import FullButton from "@/components/FullButton";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import { colors } from "@/constants";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

// 데이터 정의
const CATEGORIES = {
  국내: ["전체", "서울", "제주", "부산", "강원"],
  해외: ["전체", "일본", "동남아시아", "유럽", "남태평양"],
};

const ALL_CITIES = [
  {
    id: 1,
    title: "도쿄",
    description: "도쿄, 하코네...",
    category: "해외",
    subCategory: "일본",
  },
  {
    id: 2,
    title: "오사카",
    description: "오사카, 교토...",
    category: "해외",
    subCategory: "일본",
  },
  {
    id: 5,
    title: "서울",
    description: "강남, 홍대, 성수",
    category: "국내",
    subCategory: "서울",
  },
  {
    id: 6,
    title: "제주",
    description: "함덕, 협재, 서귀포",
    category: "국내",
    subCategory: "제주",
  },
];

export default function TripsIndex() {
  const [mainTab, setMainTab] = useState<"국내" | "해외">("해외"); // 메인 탭 상태
  const [subFilter, setSubFilter] = useState("전체"); // 하단 필터 버튼 상태
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 탭 변경 시 하위 필터 초기화
  const handleMainTabChange = (tab: "국내" | "해외") => {
    setMainTab(tab);
    setSubFilter("전체");
  };

  // 데이터 필터링 및 섹션 가공
  const filteredCities = ALL_CITIES.filter((city) => {
    if (city.category !== mainTab) return false;
    if (subFilter === "전체") return true;
    return city.subCategory === subFilter;
  });

  const sections = filteredCities.reduce((acc, city) => {
    const sectionTitle = city.subCategory;
    const existingSection = acc.find((s) => s.title === sectionTitle);
    if (existingSection) {
      existingSection.data.push(city);
    } else {
      acc.push({ title: sectionTitle, data: [city] });
    }
    return acc;
  }, [] as any[]);

  const handleCityPress = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleComplete = () => {
    const selectedCities = ALL_CITIES.filter((city) =>
      selectedIds.includes(city.id),
    );

    router.push({
      pathname: "/trip/schedule",
      params: {
        cities: JSON.stringify(selectedCities),
      },
    });
  };

  return (
    <View style={styles.safeArea}>
      <Header
        labelColor={colors.CREAM}
        backgroundColor={colors.CREAM}
        leftIcon={<GoBackIcon />}
      />
      <View style={styles.container}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.titleText}>여행, 어디로 떠나시나요?</Text>
          <Text style={styles.subText}>여행 장소를 모두 선택해주세요.</Text>
        </View>

        {/* 1. 국내/해외 메인 탭 (화면 절반씩 차지) */}
        <View style={styles.mainTabContainer}>
          {(["국내", "해외"] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.mainTab, mainTab === tab && styles.activeMainTab]}
              onPress={() => handleMainTabChange(tab)}
            >
              <Text
                style={[
                  styles.mainTabText,
                  mainTab === tab && styles.activeMainTabText,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 2. 하위 필터 버튼 (가로 스크롤) */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {CATEGORIES[mainTab].map((cat) => (
              <FilterTab
                key={cat}
                label={cat}
                isSelected={subFilter === cat}
                onPress={() => setSubFilter(cat)}
              />
            ))}
          </ScrollView>
        </View>

        {/* 섹션 리스트 */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          stickySectionHeadersEnabled={false} // 스크롤 시 헤더 고정 여부 (피그마에 따라 조절)
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <CityItem
              title={item.title}
              description={item.description}
              isSelected={selectedIds.includes(item.id)}
              onPress={() => handleCityPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>
      {selectedIds.length > 0 && (
        <View style={styles.buttonContainer}>
          <FullButton
            type="fill"
            label={`여행지 ${selectedIds.length}개 선택`}
            onPress={handleComplete}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.CLOUD },
  container: { flex: 1, backgroundColor: colors.CLOUD },
  headerTitleContainer: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.INK,
    marginBottom: 20,
  },
  subText: { fontSize: 14, color: colors.INK, fontWeight: "400" },

  // 메인 탭 스타일
  mainTabContainer: {
    flexDirection: "row",
    width: "100%",
  },
  mainTab: {
    flex: 1, // 화면의 절반씩 차지하게 함
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12, // 위아래 패딩 12
  },
  activeMainTab: {
    borderBottomWidth: 2, // 선택 시 2px solid
    borderBottomColor: colors.INK,
  },
  mainTabText: {
    fontSize: 16, // 폰트 사이즈 16
    color: colors.INK,
    fontWeight: "500",
  },
  activeMainTabText: {
    color: colors.INK,
    fontWeight: "700",
  },

  filterContainer: { paddingHorizontal: 20, paddingVertical: 15 },
  listContent: { paddingBottom: 20 },

  sectionHeader: {
    backgroundColor: colors.CLOUD,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sectionHeaderText: {
    fontSize: 16, // 폰트 사이즈 16
    fontWeight: "700",
    color: colors.INK,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
  },
});
