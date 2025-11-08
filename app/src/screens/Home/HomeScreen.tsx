import React, { useEffect, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ActionCard } from "@components/ActionCard";
import { InfoCard } from "@components/InfoCard";
import { ScreenContainer } from "@components/layout/ScreenContainer";
import { dashboardService } from "@services/dashboardService";
import type { HomeSummary } from "@types";
import { colors, spacing, typography } from "@theme/index";
import { formatDate } from "@utils/date";

type QuickAction = {
  label: string;
  description: string;
  accessibilityHint: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  iconElement?: ReactNode;
  iconColor?: string;
  iconBackgroundColor?: string;
  key: string;
};

const quickActions: QuickAction[] = [
  {
    label: "Confirmar medicação",
    description: "Registre que a dose recomendada foi tomada.",
    accessibilityHint:
      "Toque para confirmar a administração da medicação já oferecida.",
    icon: "checkmark-done-outline",
    iconColor: colors.primary,
    iconBackgroundColor: "rgba(22, 128, 140, 0.15)",
    key: "confirm-medication",
  },
  {
    label: "Agendar vacina",
    description: "Escolha rapidamente dia e horário.",
    accessibilityHint: "Toque para agendar uma nova vacina.",
    icon: "bandage-outline",
    iconElement: (
      <MaterialCommunityIcons name="needle" size={20} color={colors.primary} />
    ),
    iconBackgroundColor: "rgba(22, 128, 140, 0.12)",
    key: "schedule-vaccine",
  },
  {
    label: "Agendar consulta/exame",
    description: "Inclua consultas ou exames na agenda.",
    accessibilityHint: "Toque para agendar uma consulta ou exame.",
    icon: "calendar-outline",
    iconElement: (
      <MaterialCommunityIcons
        name="stethoscope"
        size={20}
        color={colors.primary}
      />
    ),
    iconBackgroundColor: "rgba(22, 128, 140, 0.12)",
    key: "schedule-appointment",
  },
  {
    label: "Registrar compra",
    description: "Anote a reposição das medicações.",
    accessibilityHint: "Toque para registrar uma nova compra de medicação.",
    icon: "cart-outline",
    iconColor: colors.primary,
    iconBackgroundColor: "rgba(22, 128, 140, 0.12)",
    key: "log-purchase",
  },
];

export const HomeScreen = () => {
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const lowStockItems = summary?.medicationsSummary?.lowStock ?? [];
  const nextAppointments = summary?.nextAppointments ?? [];

  const pendingConfirmations = [
    { id: "pending-1", time: "08:00", medication: "Forxiga 10mg" },
    { id: "pending-2", time: "08:00", medication: "Enalapril 20mg" },
  ];

  const upcomingIntake = [
    { id: "next-1", time: "14:00", medication: "ASS 100mg" },
    { id: "next-2", time: "14:00", medication: "Espironolactona 25mg" },
  ];

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await dashboardService.getHomeSummary();
        setSummary(data);
      } catch (error) {
        setSummary(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Resumo diário</Text>
          </View>
          <Text style={styles.heroTitle}>
            {summary?.caregiverName ? `Olá, ${summary.caregiverName}!` : "Olá!"}
          </Text>
          <Text style={styles.heroSubtitle}>
            Acompanhe as medicações e compromissos de quem você cuida em poucos
            toques.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Carregando informações...</Text>
          </View>
        ) : (
          <>
            <View style={styles.summarySection}>
              <Text style={styles.sectionPrompt}>O que você precisa?</Text>
              <View style={styles.actionsList}>
                {quickActions.map((action) => (
                  <ActionCard
                    key={action.key}
                    label={action.label}
                    accessibilityHint={action.accessibilityHint}
                    icon={action.icon}
                    iconElement={action.iconElement}
                    iconColor={action.iconColor}
                    iconBackgroundColor={action.iconBackgroundColor}
                    textColor={colors.textPrimary}
                    descriptionColor={colors.textSecondary}
                    style={styles.actionItem}
                  />
                ))}
              </View>

              <Text style={styles.sectionHeading}>Resumo do dia</Text>
              <View style={styles.summaryCards}>
                <InfoCard
                  title="Próximos compromissos"
                  icon="calendar-outline"
                  accentColor={colors.secondary}
                >
                  {nextAppointments.length ? (
                    nextAppointments.map((appointment) => {
                      const formattedDate = formatDate(
                        appointment.date,
                        "dd/MM/yyyy"
                      );
                      const time = appointment.time ?? "Horário a confirmar";
                      return (
                        <View
                          key={appointment.id}
                          style={styles.appointmentCard}
                        >
                          <Text style={styles.appointmentPatient}>
                            {appointment.patientName}
                          </Text>
                          <View style={styles.appointmentDetails}>
                            <Text style={styles.appointmentDate}>
                              {formattedDate} às {time}
                            </Text>
                            <Text style={styles.appointmentTitle}>
                              {appointment.title}
                            </Text>
                            {appointment.location ? (
                              <Text style={styles.appointmentLocation}>
                                {appointment.location}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.placeholderText}>
                      Nenhum compromisso agendado.
                    </Text>
                  )}
                </InfoCard>

                <InfoCard
                  title="Medicações"
                  icon="medkit-outline"
                  accentColor={colors.primary}
                  action={
                    <Pressable style={styles.confirmAllButton}>
                      <Text style={styles.confirmAllText}>
                        Confirmar pendentes
                      </Text>
                    </Pressable>
                  }
                >
                  <View style={styles.medSection}>
                    <Text style={styles.medSectionLabel}>
                      Confirmações pendentes
                    </Text>
                    {pendingConfirmations.map((item) => (
                      <View key={item.id} style={styles.medicationRow}>
                        <Text style={styles.medicationTime}>{item.time}</Text>
                        <Text style={styles.medicationName}>
                          {item.medication}
                        </Text>
                        <Pressable style={styles.medicationButton}>
                          <Text style={styles.medicationButtonText}>
                            Confirmar
                          </Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>

                  <View style={styles.medSection}>
                    <Text style={styles.medSectionLabel}>Próximo horário</Text>
                    {upcomingIntake.map((item) => (
                      <View key={item.id} style={styles.medicationRow}>
                        <Text style={styles.medicationTime}>{item.time}</Text>
                        <Text style={styles.medicationName}>
                          {item.medication}
                        </Text>
                      </View>
                    ))}
                  </View>
                </InfoCard>

                <InfoCard
                  title="Reposição"
                  icon="refresh-outline"
                  accentColor={colors.warning}
                >
                  {lowStockItems.length ? (
                    lowStockItems.map((item) => {
                      const severity =
                        item.remainingDoses <= 3 ? "Crítico" : "Atenção";
                      const tagStyle =
                        severity === "Crítico"
                          ? styles.tagCritical
                          : styles.tagWarning;
                      const tagTextStyle =
                        severity === "Crítico"
                          ? styles.tagCriticalText
                          : styles.tagWarningText;

                      return (
                        <View key={item.id} style={styles.restockRow}>
                          <View style={styles.restockInfo}>
                            <Text style={styles.restockName}>{item.name}</Text>
                            <Text style={styles.restockDetails}>
                              Restante: {item.remainingDoses} dias
                            </Text>
                          </View>
                          <View style={[styles.restockTag, tagStyle]}>
                            <Text style={[styles.restockTagText, tagTextStyle]}>
                              {severity}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.placeholderText}>
                      Estoque em dia. Nenhuma reposição necessária no momento.
                    </Text>
                  )}
                </InfoCard>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    gap: spacing.xl,
    paddingBottom: spacing.lg,
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    marginTop: spacing.xxl,
    gap: spacing.md,
    shadowColor: colors.primaryTint,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 3,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.secondaryTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  heroBadgeText: {
    ...typography.medium,
    color: colors.primaryContrast,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  heroTitle: {
    ...typography.semiBold,
    color: colors.primaryContrast,
    fontSize: 26,
    letterSpacing: 0.3,
  },
  heroSubtitle: {
    ...typography.regular,
    color: colors.primaryContrast,
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.regular,
    color: colors.textSecondary,
    fontSize: 16,
  },
  summarySection: {
    gap: spacing.md,
  },
  sectionPrompt: {
    ...typography.semiBold,
    color: colors.primaryStrong,
    fontSize: 18,
    letterSpacing: 0.2,
  },
  sectionHeading: {
    ...typography.semiBold,
    color: colors.textPrimary,
    fontSize: 20,
    letterSpacing: 0.3,
  },
  summaryCards: {
    gap: spacing.md,
  },
  appointmentCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
  },
  appointmentPatient: {
    ...typography.medium,
    color: colors.textPrimary,
    fontSize: 16,
  },
  appointmentDetails: {
    gap: spacing.xs,
  },
  appointmentDate: {
    ...typography.medium,
    color: colors.primaryStrong,
    fontSize: 15,
  },
  appointmentTitle: {
    ...typography.regular,
    color: colors.textSecondary,
    fontSize: 15,
  },
  appointmentLocation: {
    ...typography.regular,
    color: colors.textTertiary,
    fontSize: 14,
  },
  actionsList: {
    flexDirection: "column",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionItem: {
    width: "100%",
  },
  medSection: {
    gap: spacing.sm,
  },
  medSectionLabel: {
    ...typography.medium,
    color: colors.textPrimary,
    fontSize: 15,
  },
  medicationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  medicationTime: {
    ...typography.medium,
    color: colors.primaryStrong,
    minWidth: 56,
  },
  medicationName: {
    ...typography.regular,
    color: colors.textSecondary,
    flex: 1,
  },
  medicationButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  medicationButtonText: {
    ...typography.medium,
    color: colors.primaryContrast,
    fontSize: 13,
  },
  confirmAllButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  confirmAllText: {
    ...typography.medium,
    color: colors.primaryContrast,
    fontSize: 13,
  },
  restockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  restockInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  restockName: {
    ...typography.medium,
    color: colors.textPrimary,
    fontSize: 15,
  },
  restockDetails: {
    ...typography.regular,
    color: colors.textSecondary,
    fontSize: 14,
  },
  restockTag: {
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  restockTagText: {
    ...typography.medium,
    fontSize: 13,
  },
  tagWarning: {
    backgroundColor: colors.warning,
  },
  tagWarningText: {
    color: colors.textPrimary,
  },
  tagCritical: {
    backgroundColor: colors.danger,
  },
  tagCriticalText: {
    color: colors.primaryContrast,
  },
  placeholderText: {
    ...typography.regular,
    color: colors.textSecondary,
    fontSize: 14,
  },
});
