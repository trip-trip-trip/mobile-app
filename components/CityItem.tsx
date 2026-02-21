import { colors } from "@/constants";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface CityItemProps {
  title: string;
  description: string;
  imageUri?: string;
  isSelected: boolean;
  onPress: () => void;
}

function CityItem({
  title,
  description,
  imageUri,
  isSelected,
  onPress,
}: CityItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isSelected && styles.selected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage} />
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text numberOfLines={1} style={styles.description}>
            {description}
          </Text>
        </View>

        <View
          style={[styles.statusIndicator, isSelected && styles.activeIndicator]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.CLOUD,
  },
  selected: {
    backgroundColor: colors.CREAM,
  },
  pressed: {
    opacity: 0.7,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginRight: 10,
    backgroundColor: colors.CREAM,
    borderWidth: 1,
    borderColor: colors.NAVY,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.CREAM,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.NAVY,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.NAVY,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.CREAM,
    marginLeft: 12,
  },
  activeIndicator: {
    backgroundColor: colors.NAVY,
  },
});

export default CityItem;
