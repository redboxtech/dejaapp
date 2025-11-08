import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@components/layout/ScreenContainer";
import { colors, spacing, typography } from "@theme/index";

export const MedicationsScreen = () => {
  return (
    <ScreenContainer>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Medicações</Text>
        <Text style={styles.description}>
          Aqui você acompanhará as medicações, estoques e alarmes. Essa área ficará disponível
          em breve.
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

