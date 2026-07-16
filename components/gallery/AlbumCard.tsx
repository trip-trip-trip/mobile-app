import { colors } from "@/constants/colors";
import { TripInfo } from "@/types/gallery";
import { formatDateRangeToEnglish } from "@/utils/date";
import { Feather } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";
import { SharedProfiles } from "./SharedProfiles";

type AlbumCardProps = {
  data: TripInfo;
};

export const AlbumCard = ({ data }: AlbumCardProps) => {
  const coverUri = data.coverImage ?? data.photos[0] ?? "";

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
        {formatDateRangeToEnglish(data.startDate, data.endDate)}
      </Text>

      <View style={{ flexDirection: "row" }}>
        <View style={styles.cardRight}>
          {coverUri ? (
            <Image
              source={{ uri: coverUri }}
              style={{ width: 152, height: 152 }}
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Feather
                name={data.videoCount > 0 ? "film" : "camera"}
                size={36}
                color={colors.NAVY}
              />
              <Text style={styles.coverPlaceholderText}>
                {data.videoCount > 0 ? "VIDEO ONLY" : "NO SHOTS"}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.cardLeft}>
          <View
            style={{
              gap: 4,
              borderBottomWidth: 1,
              borderBottomColor: colors.NAVY,
              padding: 10,
              width: "100%",
            }}
          >
            <Text style={styles.contentText}>{data.title}</Text>
            <Text style={styles.contentShots}>
              {data.photoCount} SHOTS • {data.videoCount} VIDEOS
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                borderRightWidth: 1,
                borderRightColor: colors.NAVY,
                paddingHorizontal: 12,
                paddingVertical: 6,
                gap: 5,
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              <Text style={styles.contentTitle}>LOCATION</Text>
              <Text style={styles.contentText}>{data.placeName}</Text>
            </View>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                gap: 1,
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.contentTitle}>PEOPLE</Text>
              <SharedProfiles data={data.members} size={20} />
            </View>
          </View>
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: colors.NAVY,
              flexDirection: "row",
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 5,
              alignItems: "center",
              height: "auto",
            }}
          >
            {data.photos.slice(0, 4).map((p, index) => (
              <Image
                key={index}
                source={{ uri: p }}
                style={{ width: 40, height: 40, borderRadius: 2 }}
              />
            ))}
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
  coverPlaceholder: {
    width: 152,
    height: 152,
    backgroundColor: colors.CREAM,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  coverPlaceholderText: {
    fontSize: 10,
    color: colors.NAVY,
    fontFamily: "Monoplex KR",
    fontWeight: 700,
    letterSpacing: 1,
  },
  contentTitle: {
    fontSize: 10,
    color: colors.NAVY,
    fontFamily: "Monoplex KR",
    fontWeight: 700,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 14,
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
