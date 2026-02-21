import DefaultProfile from "@/assets/icons/default_profile.svg";
import { colors } from "@/constants/colors";
import { Image, StyleSheet, View } from "react-native";

export const SharedProfiles = ({ data }: any) => {
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
              <DefaultProfile width={27} height={27} />
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
    marginRight: -5,
  },
  profile: {
    width: 26,
    height: 26,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.CLOUD,
    backgroundColor: colors.NAVY,
  },
  defaultProfile: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
});
