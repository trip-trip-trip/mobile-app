import { colors } from "@/constants/colors";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export const Title = ({ children }: { children: ReactNode }) => {
  return (
    <View style={styles.titleCont}>
      <Text style={styles.title}>{children}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    color: colors.NAVY,
    fontFamily: "Monoplex KR",
    fontWeight: 400,
    marginVertical: 8,
  },
  titleCont: {
    width: "100%",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.NAVY,
    borderStyle: "dashed",
    borderRadius: 1,
    marginBottom: 21,
  },
});
