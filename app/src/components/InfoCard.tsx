import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View, ViewProps } from "react-native";

import { colors, spacing, typography } from "@theme/index";

type InfoCardProps = ViewProps & {
  title: string;
  description?: string;
  items?: Array<{ label: string; value: string }>;
  footer?: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
};

export const InfoCard = ({
  title,
  description,
  items,
  footer,
  icon,
  accentColor = colors.secondary,
  action,
  children,
  style,
  ...rest
}: InfoCardProps) => (
  <View style={[styles.container, style]} {...rest}>
    <View style={styles.header}>
      {icon ? (
        <View style={[styles.iconBadge, { backgroundColor: `${accentColor}22` }]}>
          <Ionicons name={icon} size={24} color={accentColor} />
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {action ? <View style={styles.actionContainer}>{action}</View> : null}
    </View>
    {children ? <View style={styles.content}>{children}</View> : null}
    {!children && items ? (
      <View style={styles.itemsContainer}>
        {items.map((item, index) => (
          <View key={`${title}-${item.label}-${index}`} style={styles.itemRow}>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text style={styles.itemValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    ) : null}
    {!children && !items && description ? <Text style={styles.description}>{description}</Text> : null}
    {footer ? <View style={styles.footer}>{footer}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: colors.overlay,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 1,
    gap: spacing.sm
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    ...typography.semiBold,
    color: colors.primaryStrong,
    fontSize: 18,
    letterSpacing: 0.3
  },
  actionContainer: {
    marginLeft: "auto"
  },
  content: {
    gap: spacing.sm
  },
  description: {
    ...typography.regular,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22
  },
  itemsContainer: {
    gap: spacing.xs
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  itemLabel: {
    ...typography.regular,
    color: colors.textSecondary,
    fontSize: 14
  },
  itemValue: {
    ...typography.medium,
    color: colors.textPrimary,
    fontSize: 14
  },
  footer: {
    marginTop: spacing.xs,
    gap: spacing.xs
  }
});

