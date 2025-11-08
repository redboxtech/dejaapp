import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@components/layout/ScreenContainer";
import { colors, spacing, typography } from "@theme/index";

export const ProfileScreen = () => {
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>
          Configure seus dados pessoais, contatos e preferências de notificação aqui.
        </Text>
      </View>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Em breve você poderá revisar informações da conta, pacientes vinculados e alertas
          importantes neste espaço.
        </Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginBottom: spacing.xl
  },
  title: {
    ...typography.semiBold,
    color: colors.textPrimary,
    fontSize: 24
  },
  subtitle: {
    ...typography.regular,
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24
  },
  placeholder: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg
  },
  placeholderText: {
    ...typography.regular,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center"
  }
});


