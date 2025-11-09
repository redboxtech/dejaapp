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
  badge?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  badgeBorderColor?: string;
  secondaryBadge?: string;
  secondaryBadgeColor?: string;
  secondaryBadgeTextColor?: string;
  secondaryBadgeBorderColor?: string;
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
  pressedBackgroundColor?: string;
  pressedBorderColor?: string;
};

export const ActionCard = ({
  label,
  badge,
  badgeColor = colors.primary,
  badgeTextColor = colors.primaryContrast,
  badgeBorderColor,
  secondaryBadge,
  secondaryBadgeColor = colors.warning,
  secondaryBadgeTextColor = colors.textPrimary,
  secondaryBadgeBorderColor,
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
  iconSize = 22,
  pressedBackgroundColor = colors.secondaryTint,
  pressedBorderColor = colors.primary
}: ActionCardProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !onPress }}
      onPress={onPress}
      android_ripple={{
        color: pressedBackgroundColor,
        foreground: true
      }}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? pressedBackgroundColor : backgroundColor,
          borderColor: pressed ? pressedBorderColor : colors.surfaceBorder
        },
        pressed && styles.pressed,
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
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
            {(badge || secondaryBadge) && (
              <View style={styles.badgeColumn}>
                {secondaryBadge ? (
                  <View
                    style={[
                      styles.badge,
                      styles.secondaryBadge,
                      { backgroundColor: secondaryBadgeColor },
                      secondaryBadgeBorderColor
                        ? {
                            borderWidth: 1,
                            borderColor: secondaryBadgeBorderColor,
                          }
                        : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        styles.secondaryBadgeText,
                        { color: secondaryBadgeTextColor }
                      ]}
                    >
                      {secondaryBadge}
                    </Text>
                  </View>
                ) : null}
                {badge ? (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: badgeColor },
                      badgeBorderColor
                        ? { borderWidth: 1, borderColor: badgeBorderColor }
                        : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: badgeTextColor }
                      ]}
                    >
                      {badge}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>
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
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 2,
    transform: [{ scale: 1 }]
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
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  badgeColumn: {
    alignItems: "flex-end",
    gap: spacing.xs
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 1.5,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryBadge: {
    minWidth: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 1.5
  },
  badgeText: {
    ...typography.medium,
    color: colors.primaryContrast,
    fontSize: 13,
    letterSpacing: 0.3
  },
  secondaryBadgeText: {
    ...typography.medium,
    fontSize: 13,
    letterSpacing: 0.4
  },
  label: {
    ...typography.medium,
    color: colors.textPrimary,
    fontSize: 17,
    letterSpacing: 0.15,
    flexShrink: 1,
    flex: 1,
    marginRight: spacing.sm
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
  },
  pressed: {
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 3,
    transform: [{ scale: 0.97 }]
  }
});

