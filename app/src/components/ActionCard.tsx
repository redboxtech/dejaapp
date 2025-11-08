import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle
} from "react-native";

import { colors, spacing, typography } from "@theme/index";

type ActionCardProps = {
  label: string;
  description?: string;
  onPress?: () => void;
  accessibilityHint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconElement?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  textColor?: string;
  descriptionColor?: string;
  iconColor?: string;
  iconBackgroundColor?: string;
  iconSize?: number;
};

export const ActionCard = ({
  label,
  description,
  onPress,
  accessibilityHint,
  icon = "checkmark-circle-outline",
  iconElement,
  style,
  backgroundColor = "rgba(108, 206, 217, 0.24)",
  textColor = colors.textPrimary,
  descriptionColor = colors.textSecondary,
  iconColor = colors.primary,
  iconBackgroundColor = "rgba(108, 206, 217, 0.32)",
  iconSize = 22
}: ActionCardProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor, borderColor: colors.surfaceBorder },
        pressed && { backgroundColor: colors.secondaryTint },
        style
      ]}
    >
      <View style={styles.row}>
        <View style={styles.iconWrapper}>
          <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
            {iconElement ? (
              iconElement
            ) : (
              <Ionicons name={icon} size={iconSize} color={iconColor} />
            )}
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
          {description ? (
            <Text style={[styles.description, { color: descriptionColor }]}>{description}</Text>
          ) : null}
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    shadowColor: colors.overlay,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  content: {
    flex: 1,
    gap: spacing.xs
  },
  label: {
    ...typography.medium,
    color: colors.textPrimary,
    fontSize: 18,
    letterSpacing: 0.2
  },
  description: {
    ...typography.regular,
    color: colors.textSecondary,
    fontSize: 14
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center"
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  }
});

