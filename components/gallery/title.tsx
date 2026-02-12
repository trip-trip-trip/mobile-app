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
  container: {
    flex: 1,
    padding: 20,
    fontFamily: "Monoplex KR",
  },
  title: {
    fontSize: 24,
    color: colors.NAVY,
    fontFamily: "Monoplex KR",
    fontWeight: 400,
    margin: 12,
  },
  titleCont: {
    backgroundColor: "",
    flex: 1,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.NAVY,
    borderStyle: "dashed",
    marginBottom: 21,
  },
});
