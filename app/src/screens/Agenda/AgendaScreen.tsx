import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@components/layout/ScreenContainer";
import { colors, spacing, typography } from "@theme/index";

export const AgendaScreen = () => {
  return (
    <ScreenContainer>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Agenda</Text>
        <Text style={styles.description}>
          Em breve você poderá visualizar e organizar as vacinas, consultas e exames aqui.
        </Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md
  },
  title: {
    ...typography.semiBold,
    color: colors.textPrimary,
    fontSize: 24,
    textAlign: "center"
  },
  description: {
    ...typography.regular,
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center"
  }
});

