import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export const TicketLabel = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.contentText}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    fontFamily: "Monoplex KR",
    gap: 1,
    marginVertical: 12,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 12,
    color: "#335270",
    fontFamily: "Monoplex KR",
    fontWeight: 700,
  },
  contentText: {
    fontSize: 16,
    color: "#335270",
    fontWeight: 400,
    fontFamily: "Monoplex KR",
  },
});
