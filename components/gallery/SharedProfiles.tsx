import DefaultProfile from "@/assets/icons/default_profile.svg";
import { colors } from "@/constants/colors";
import { Image, StyleSheet, View } from "react-native";

type ProfileProps = {
  data: string[];
  size: number;
};

export const SharedProfiles = ({ data, size }: ProfileProps) => {
  return (
    <View style={styles.container}>
      {data.length ? (
        data.map((uri, index) => (
          <View key={`${uri}-${index}`} style={styles.profileWrapper}>
            {uri ? (
              <Image
                source={{ uri }}
                style={[styles.profile, { width: size, height: size }]}
                resizeMode="cover"
                onError={(e) =>
                  console.log("profile image error:", uri, e.nativeEvent)
                }
              />
            ) : (
              <View
                style={[
                  styles.profile,
                  styles.defaultProfile,
                  { width: size, height: size },
                ]}
              >
                <DefaultProfile width={size} height={size} />
              </View>
            )}
          </View>
        ))
      ) : (
        <View
          style={[
            styles.profile,
            styles.defaultProfile,
            { width: size, height: size },
          ]}
        >
          <DefaultProfile width={size} height={size} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center" },
  profileWrapper: {
    marginRight: -7,
    overflow: "hidden",
    backgroundColor: colors.CLOUD,
  },
  profile: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.CLOUD,
    backgroundColor: colors.CLOUD,
  },
  defaultProfile: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
});
