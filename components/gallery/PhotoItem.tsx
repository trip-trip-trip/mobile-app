import { colors } from "@/constants/colors";
import { Image, StyleSheet, Text, View } from "react-native";

type PhotoItemProps = {
  image?: string;
  location?: string | null;
  date: string;
  num: number;
  day: number;
};

export const PhotoItem = ({
  image,
  location,
  date,
  num,
  day,
}: PhotoItemProps) => {
  return (
    <View style={styles.photoItem}>
      <Image
        source={{
          uri: image,
        }}
        style={styles.image}
      />
      <Text style={styles.imageLocation}>{location}</Text>
      <View style={styles.imageFooter}>
        <Text style={styles.imageFooterText}>{date}</Text>
        <Text style={[styles.imageFooterText, { color: "#DA4646" }]}>
          D{day}-#{num}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  photoGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 10 },
  photoItem: { width: "100%", padding: 5 },
  image: { width: "100%", aspectRatio: 1 },
  imageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.INK,
    padding: 5,
  },
  imageFooterText: {
    color: colors.CLOUD,
    fontSize: 10,
    fontFamily: "Orbit",
    fontWeight: 400,
  },
  imageLocation: {
    justifyContent: "center",
    fontSize: 8,
    margin: 4,
    fontFamily: "Orbit",
    fontWeight: 400,
    alignItems: "center",
    backgroundColor: colors.CLOUD,
    padding: 2,
    position: "absolute",
    top: 5,
    right: 5,
  },
});
