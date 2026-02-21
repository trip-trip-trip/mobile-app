import { colors } from "@/constants/colors";
import { Image, StyleSheet, Text, View } from "react-native";

export const AlbumCard = () => {
  return (
    <View style={styles.card}>
      <Text
        style={{
          fontSize: 12,
          color: colors.NAVY,
          fontFamily: "Monoplex KR",
          fontWeight: 400,
          borderBottomWidth: 1,
          borderBottomColor: colors.NAVY,
          paddingVertical: 6,
          paddingHorizontal: 16,
          backgroundColor: colors.CREAM,
        }}
      >
        FEB 05 - FEB 05, 2026
      </Text>
      <View style={{ flexDirection: "row" }}>
        <View style={styles.cardRight}>
          <Image
            source={require("../../assets/photo/dummyImage.jpeg")}
            style={{ width: 152, height: 152 }}
          />
        </View>
        <View style={styles.cardLeft}>
          <View
            style={{
              gap: 6,
              borderBottomWidth: 1,
              borderBottomColor: colors.NAVY,
              padding: 12,
              width: "100%",
            }}
          >
            <Text style={styles.contentText}>굉장히 신나는 여행</Text>
            <Text style={styles.contentShots}>4 SHOTS • 0 VIDEOS</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                borderRightWidth: 1,
                borderRightColor: colors.NAVY,
                paddingHorizontal: 12,
                paddingVertical: 6,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={styles.contentTitle}>LOCATION</Text>
              <Text style={styles.contentText}>제주도</Text>
            </View>
            <View style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={styles.contentTitle}>PEOPLE</Text>
              <Text style={styles.contentText}>사람들</Text>
            </View>
          </View>
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: colors.NAVY,
              flexDirection: "row",
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 6,
              alignItems: "center",
              height: "auto",
            }}
          >
            <Image
              source={require("../../assets/photo/dummyImage.jpeg")}
              style={{ width: 40, height: 40, borderRadius: 2 }}
            />
            <Image
              source={require("../../assets/photo/dummyImage.jpeg")}
              style={{ width: 40, height: 40, borderRadius: 2 }}
            />
            <Image
              source={require("../../assets/photo/dummyImage.jpeg")}
              style={{ width: 40, height: 40, borderRadius: 2 }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    marginBottom: 15,
  },
  cardRight: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
    width: "43%",
  },
  cardLeft: {
    backgroundColor: colors.CLOUD,
    width: "57%",
  },
  contentTitle: {
    fontSize: 10,
    color: colors.NAVY,
    fontFamily: "Monoplex KR",
    fontWeight: 700,
  },
  contentText: {
    fontSize: 14,
    color: colors.NAVY,
    fontWeight: 400,
    fontFamily: "Monoplex KR",
  },
  contentShots: {
    fontSize: 10,
    color: colors.RED,
    fontFamily: "Monoplex KR",
    fontWeight: 700,
  },
});
