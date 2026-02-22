import DefaultProfile from "@/assets/icons/default_profile.svg";
import { colors } from "@/constants/colors";
import { Image, StyleSheet, View } from "react-native";

type profileProps = {
  data: string[];
  size: number;
};

export const SharedProfiles = ({ data, size }: profileProps) => {
  return (
    <View style={styles.container}>
      {data.map((friend: any, index: number) => (
        <View key={index} style={styles.profileWrapper}>
          {friend.profile ? (
            <Image
              source={{ uri: friend.profile }}
              style={styles.profile}
              alt={friend.name || "Friend Profile"}
            />
          ) : (
            <View style={[styles.profile, styles.defaultProfile]}>
              <DefaultProfile width={size} height={size} />
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileWrapper: {
    marginRight: -7,
  },
  profile: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.CLOUD,
  },
  defaultProfile: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
});
