import CityItem from "@/components/CityItem";
import FilterTab from "@/components/FilterTab";
import FullButton from "@/components/FullButton";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import { colors } from "@/constants";
import { router } from "expo-router";
import { useState } from "react";
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
  // 해외 - 일본
  {
    id: 1,
    title: "도쿄",
    description: "도쿄, 하코네, 가마쿠라",
    category: "해외",
    subCategory: "일본",
  },
  {
    id: 2,
    title: "오사카",
    description: "오사카, 교토, 나라",
    category: "해외",
    subCategory: "일본",
  },
  {
    id: 3,
    title: "후쿠오카",
    description: "후쿠오카, 벳푸, 유후인",
    category: "해외",
    subCategory: "일본",
  },
  {
    id: 4,
    title: "홋카이도",
    description: "삿포로, 오타루, 후라노",
    category: "해외",
    subCategory: "일본",
  },

  // 해외 - 동남아시아
  {
    id: 10,
    title: "방콕",
    description: "방콕, 파타야, 후아힌",
    category: "해외",
    subCategory: "동남아시아",
  },
  {
    id: 11,
    title: "푸켓",
    description: "푸켓, 카오락, 피피섬",
    category: "해외",
    subCategory: "동남아시아",
  },
  {
    id: 12,
    title: "다낭",
    description: "다낭, 호이안, 후에",
    category: "해외",
    subCategory: "동남아시아",
  },
  {
    id: 13,
    title: "싱가포르",
    description: "마리나베이, 센토사, 오차드",
    category: "해외",
    subCategory: "동남아시아",
  },
  {
    id: 14,
    title: "발리",
    description: "우붓, 세미냑, 누사두아",
    category: "해외",
    subCategory: "동남아시아",
  },

  // 해외 - 유럽
  {
    id: 20,
    title: "파리",
    description: "에펠탑, 루브르, 몽마르트",
    category: "해외",
    subCategory: "유럽",
  },
  {
    id: 21,
    title: "런던",
    description: "빅벤, 대영박물관, 타워브릿지",
    category: "해외",
    subCategory: "유럽",
  },
  {
    id: 22,
    title: "로마",
    description: "콜로세움, 바티칸, 트레비분수",
    category: "해외",
    subCategory: "유럽",
  },
  {
    id: 23,
    title: "바르셀로나",
    description: "사그라다파밀리아, 구엘공원, 람블라스",
    category: "해외",
    subCategory: "유럽",
  },

  // 해외 - 남태평양
  {
    id: 30,
    title: "괌",
    description: "투몬비치, 차모로빌리지, 연인의절벽",
    category: "해외",
    subCategory: "남태평양",
  },
  {
    id: 31,
    title: "사이판",
    description: "마나가하섬, 그로토, 만세절벽",
    category: "해외",
    subCategory: "남태평양",
  },
  {
    id: 32,
    title: "하와이",
    description: "와이키키, 다이아몬드헤드, 진주만",
    category: "해외",
    subCategory: "남태평양",
  },

  // 국내 - 서울
  {
    id: 40,
    title: "서울",
    description: "강남, 홍대, 성수",
    category: "국내",
    subCategory: "서울",
  },
  {
    id: 41,
    title: "경복궁",
    description: "종로, 북촌, 삼청동",
    category: "국내",
    subCategory: "서울",
  },

  // 국내 - 제주
  {
    id: 50,
    title: "제주시",
    description: "함덕, 월정리, 애월",
    category: "국내",
    subCategory: "제주",
  },
  {
    id: 51,
    title: "서귀포",
    description: "중문, 협재, 성산일출봉",
    category: "국내",
    subCategory: "제주",
  },

  // 국내 - 부산
  {
    id: 60,
    title: "부산",
    description: "해운대, 광안리, 남포동",
    category: "국내",
    subCategory: "부산",
  },
  {
    id: 61,
    title: "기장",
    description: "해동용궁사, 죽성성당, 일광해수욕장",
    category: "국내",
    subCategory: "부산",
  },

  // 국내 - 강원
  {
    id: 70,
    title: "강릉",
    description: "경포대, 정동진, 안목해변",
    category: "국내",
    subCategory: "강원",
  },
  {
    id: 71,
    title: "속초",
    description: "설악산, 속초해수욕장, 아바이마을",
    category: "국내",
    subCategory: "강원",
  },
  {
    id: 72,
    title: "평창",
    description: "대관령, 양떼목장, 알펜시아",
    category: "국내",
    subCategory: "강원",
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
  container: {
    flex: 1,
    backgroundColor: colors.CLOUD,
    fontFamily: "MonoplexKR-Regular",
  },
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
