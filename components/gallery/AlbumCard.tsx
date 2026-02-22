import { colors } from "@/constants/colors";
import { TripInfo } from "@/types/GalleryType";
import { Image, StyleSheet, Text, View } from "react-native";
import { SharedProfiles } from "./SharedProfiles";

type AlbumCardProps = {
  data: TripInfo;
};

const formatDateRange = (start: string, end: string) => {
  const baseOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "2-digit",
  };

  const startStr = new Date(start).toLocaleDateString("en-US", baseOptions);
  const endStr = new Date(end).toLocaleDateString("en-US", {
    ...baseOptions,
    year: "numeric",
  });

  return `${startStr} - ${endStr}`.toUpperCase();
};

export const AlbumCard = ({ data }: AlbumCardProps) => {
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
        {formatDateRange(data.startDate, data.endDate)}
      </Text>

      <View style={{ flexDirection: "row" }}>
        <View style={styles.cardRight}>
          <Image
            source={{ uri: data.coverImage }}
            style={{ width: 152, height: 152 }}
          />
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
                alignItems: "center",
              }}
            >
              <Text style={styles.contentTitle}>LOCATION</Text>
              <Text style={styles.contentText}>{data.placeName}</Text>
            </View>
            <View style={{ paddingHorizontal: 12, paddingVertical: 6, gap: 5 }}>
              <Text style={styles.contentTitle}>PEOPLE</Text>
              <SharedProfiles data={data.members} size={16} />
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
