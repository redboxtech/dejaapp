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

import { ActionCard } from "@components/ActionCard";
import { InfoCard } from "@components/InfoCard";
import { ScreenContainer } from "@components/layout/ScreenContainer";
import { dashboardService } from "@services/dashboardService";
import type { HomeSummary } from "@types";
import { colors, spacing, typography } from "@theme/index";
import { formatDate } from "@utils/date";

type QuickAction = {
  label: string;
  badge?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  badgeBorderColor?: string;
  secondaryBadge?: string;
  secondaryBadgeColor?: string;
  secondaryBadgeTextColor?: string;
  secondaryBadgeBorderColor?: string;
  description: string;
  accessibilityHint: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  iconElement?: ReactNode;
  iconColor?: string;
  iconBackgroundColor?: string;
  backgroundColor?: string;
  textColor?: string;
  descriptionColor?: string;
  pressedBackgroundColor?: string;
  pressedBorderColor?: string;
  key: string;
};

const quickActions: QuickAction[] = [
  {
    label: "Confirmar medicação",
    secondaryBadge: "08:00",
    secondaryBadgeColor: colors.warning,
    secondaryBadgeTextColor: colors.textPrimary,
    secondaryBadgeBorderColor: colors.textPrimary,
    description: "Registre rapidamente que a dose recomendada foi tomada.",
    accessibilityHint:
      "Toque para confirmar que a medicação do horário foi administrada.",
    icon: "checkmark-done-outline",
    iconColor: colors.primaryStrong,
    iconBackgroundColor: "rgba(242, 195, 107, 0.72)",
    backgroundColor: "rgba(242, 195, 107, 0.24)",
    textColor: colors.textPrimary,
    descriptionColor: colors.textPrimary,
    pressedBackgroundColor: "rgba(242, 195, 107, 0.38)",
    pressedBorderColor: colors.warning,
    key: "confirm-medication",
  },
  {
    label: "Repor medicações",
    description: "Solicite reposição antes que as doses acabem.",
    accessibilityHint:
      "Toque para iniciar a reposição quando o estoque estiver baixo.",
    icon: "medkit-outline",
    iconColor: colors.primary,
    iconBackgroundColor: "rgba(22, 128, 140, 0.12)",
    key: "restock-medications",
  },
  {
    label: "Adicionar agenda",
    description: "Inclua uma consulta, exame ou vacinação na rotina.",
    accessibilityHint:
      "Toque para adicionar rapidamente um novo compromisso ao calendário.",
    icon: "calendar-outline",
    iconColor: colors.primary,
    iconBackgroundColor: "rgba(22, 128, 140, 0.12)",
    key: "add-schedule",
  },
  {
    label: "Ver Medicações do dia",
    description: "Veja o que ainda falta confirmar ou tomar hoje.",
    accessibilityHint:
      "Toque para revisar as medicações previstas para o dia e acompanhar o andamento.",
    icon: "document-text-outline",
    iconColor: colors.primary,
    iconBackgroundColor: "rgba(22, 128, 140, 0.12)",
    key: "daily-medications",
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
                    badge={action.badge}
                    badgeColor={action.badgeColor}
                    badgeTextColor={action.badgeTextColor}
                    secondaryBadge={action.secondaryBadge}
                    secondaryBadgeColor={action.secondaryBadgeColor}
                    secondaryBadgeTextColor={action.secondaryBadgeTextColor}
                    accessibilityHint={action.accessibilityHint}
                    icon={action.icon}
                    iconElement={action.iconElement}
                    iconColor={action.iconColor}
                    iconBackgroundColor={action.iconBackgroundColor}
                    backgroundColor={action.backgroundColor}
                    textColor={action.textColor ?? colors.textPrimary}
                    descriptionColor={action.descriptionColor ?? colors.textSecondary}
                    pressedBackgroundColor={action.pressedBackgroundColor}
                    pressedBorderColor={action.pressedBorderColor}
                    style={styles.actionItem}
                  />
                ))}
              </View>

              <View style={styles.summaryCards}>
                <InfoCard
                  title="Próximos compromissos"
                  icon="calendar-outline"
                  accentColor={colors.primary}
                >
                  {nextAppointments.length ? (
                    Object.entries(
                      nextAppointments.reduce<Record<string, typeof nextAppointments>>(
                        (acc, appointment) => {
                          acc[appointment.patientName] ??= [];
                          acc[appointment.patientName].push(appointment);
                          return acc;
                        },
                        {}
                      )
                    ).map(([patientName, appointments]) => (
                      <View key={patientName} style={styles.appointmentGroup}>
                        <View style={styles.appointmentGroupHeader}>
                          <Ionicons
                            name="person-circle"
                            size={28}
                            color={colors.primary}
                          />
                          <View style={styles.appointmentGroupTitleWrapper}>
                            <Text style={styles.appointmentGroupTitle}>
                              {patientName}
                            </Text>
                            <Text style={styles.appointmentGroupSubtitle}>
                              {appointments.length}{" "}
                              {appointments.length === 1
                                ? "compromisso"
                                : "compromissos"}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.appointmentGroupList}>
                          {appointments.map((appointment) => {
                            const formattedDate = formatDate(
                              appointment.date,
                              "EEEE, dd/MM"
                            );
                            const time =
                              appointment.time ?? "Horário a confirmar";
                            return (
                              <View
                                key={appointment.id}
                                style={styles.appointmentCard}
                              >
                                <Text style={styles.appointmentDateLarge}>
                                  {formattedDate.charAt(0).toUpperCase() +
                                    formattedDate.slice(1)}{" "}
                                  · {time}
                                </Text>
                                <Text style={styles.appointmentTitle}>
                                  {appointment.title}
                                </Text>
                                {appointment.location ? (
                                  <View
                                    style={styles.appointmentLocationWrapper}
                                  >
                                    <Ionicons
                                      name="location-outline"
                                      size={18}
                                      color={colors.textSecondary}
                                    />
                                    <Text style={styles.appointmentLocation}>
                                      {appointment.location}
                                    </Text>
                                  </View>
                                ) : null}
                                {appointment.id === "apt-1" ? (
                                  <Pressable style={styles.appointmentConfirmButton}>
                                    <Ionicons
                                      name="hand-left-outline"
                                      size={20}
                                      color={colors.primaryStrong}
                                    />
                                    <Text style={styles.appointmentConfirmText}>
                                      Confirmar presença
                                    </Text>
                                  </Pressable>
                                ) : null}
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    ))
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
                >
                  <View style={styles.medSection}>
                    <Text style={styles.medSectionLabel}>
                      Confirmações pendentes
                    </Text>
                     <View style={styles.medicationList}>
                       {pendingConfirmations.map((item) => (
                         <View key={item.id} style={styles.medicationRowAlert}>
                           <View style={styles.medicationRowHeader}>
                             <View style={styles.timeBadgeAlert}>
                               <Ionicons
                                 name="warning-outline"
                                 size={18}
                                 color={colors.primaryStrong}
                               />
                               <Text style={styles.timeBadgeAlertText}>
                                 {item.time}
                               </Text>
                             </View>
                             <Text style={styles.medicationNameBold}>
                               {item.medication}
                             </Text>
                           </View>
                           <Text style={styles.medicationAlertDescription}>
                             Confirme esta dose para manter o controle do tratamento.
                           </Text>
                         </View>
                       ))}
                     </View>
                    <Pressable style={styles.confirmAllButton}>
                      <Ionicons
                        name="checkmark-done-outline"
                        size={20}
                        color={colors.primaryStrong}
                      />
                      <Text style={styles.confirmAllText}>
                        Confirmar pendentes
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.medSection}>
                    <Text style={styles.medSectionLabel}>Próximo horário</Text>
                    <View style={styles.medicationList}>
                      {upcomingIntake.map((item) => (
                        <View key={item.id} style={styles.medicationRow}>
                          <View style={styles.medicationRowHeader}>
                            <View style={styles.timeBadgeMuted}>
                              <Ionicons
                                name="alarm-outline"
                                size={16}
                                color={colors.primary}
                              />
                              <Text style={styles.timeBadgeMutedText}>
                                {item.time}
                              </Text>
                            </View>
                            <Text style={styles.medicationName}>
                              {item.medication}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </InfoCard>

                <InfoCard
                  title="Reposição"
                  icon="refresh-outline"
                  accentColor={colors.primary}
                >
                  {lowStockItems.length ? (
                    <>
                      <View style={styles.restockList}>
                        {[...lowStockItems]
                          .sort((a, b) => a.remainingDoses - b.remainingDoses)
                          .map((item) => {
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
                              <View
                                key={item.id}
                                style={[
                                  styles.restockRow,
                                  severity === "Crítico"
                                    ? styles.restockRowCritical
                                    : styles.restockRowWarning,
                                ]}
                              >
                                <View style={styles.restockRowHeader}>
                                  <View
                                    style={[styles.restockSeverityBadge, tagStyle]}
                                  >
                                    <Text
                                      style={[
                                        styles.restockSeverityText,
                                        tagTextStyle,
                                      ]}
                                    >
                                      {severity}
                                    </Text>
                                  </View>
                                  <Text style={styles.restockName}>
                                    {item.name}
                                  </Text>
                                </View>
                                <Text style={styles.restockDetails}>
                                  Restam {item.remainingDoses}{" "}
                                  {item.remainingDoses === 1 ? "dia" : "dias"} disponíveis.
                                </Text>
                                {item.refillLocation ? (
                                   <View style={styles.restockLocationRow}>
                                    <Ionicons
                                      name="location-outline"
                                      size={18}
                                      color={colors.textSecondary}
                                    />
                                    <Text style={styles.restockLocationText}>
                                      {item.refillLocation}
                                    </Text>
                                   </View>
                                 ) : null}
                              </View>
                            );
                          })}
                      </View>
                      <Pressable style={styles.restockActionButton}>
                        <Ionicons
                          name="logo-whatsapp"
                          size={22}
                          color={colors.primaryContrast}
                        />
                        <Text style={styles.restockActionText}>
                          Solicitar à farmácia
                        </Text>
                      </Pressable>
                    </>
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
    borderRadius: 18,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.overlay,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  appointmentGroup: {
    gap: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: "rgba(22, 128, 140, 0.08)",
    borderRadius: 20,
    padding: spacing.lg,
  },
  appointmentGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  appointmentGroupTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  appointmentGroupTitle: {
    ...typography.semiBold,
    color: colors.textPrimary,
    fontSize: 20,
  },
  appointmentGroupSubtitle: {
    ...typography.medium,
    color: colors.textSecondary,
    fontSize: 15,
  },
  appointmentGroupList: {
    gap: spacing.md,
  },
  appointmentDateLarge: {
    ...typography.semiBold,
    color: colors.primaryStrong,
    fontSize: 21,
    letterSpacing: 0.3,
  },
  appointmentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  appointmentBadgeText: {
    ...typography.medium,
    color: colors.primaryContrast,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  appointmentTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  appointmentTimeText: {
    ...typography.medium,
    color: colors.primary,
    fontSize: 16,
  },
  appointmentPatient: {
    ...typography.semiBold,
    color: colors.textPrimary,
    fontSize: 17,
  },
  appointmentPatientSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
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
    ...typography.semiBold,
    color: colors.textSecondary,
    fontSize: 20,
  },
  appointmentLocationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  appointmentLocation: {
    ...typography.medium,
    color: colors.textSecondary,
    fontSize: 15,
  },
  appointmentConfirmButton: {
    marginTop: spacing.lg,
    backgroundColor: "rgba(242, 195, 107, 0.24)",
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.warning,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  appointmentConfirmText: {
    ...typography.semiBold,
    color: colors.textPrimary,
    fontSize: 16,
    letterSpacing: 0.4,
    textAlign: "center",
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
    gap: spacing.md,
  },
  medSectionLabel: {
    ...typography.semiBold,
    color: colors.textPrimary,
    fontSize: 20,
    letterSpacing: 0.3,
  },
  medicationList: {
    gap: spacing.md,
  },
  medicationRow: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  medicationRowAlert: {
    backgroundColor: "rgba(255, 170, 51, 0.2)",
    borderRadius: 18,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  medicationRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  medicationNameBold: {
    ...typography.semiBold,
    color: colors.textPrimary,
    flexShrink: 1,
    fontSize: 20,
  },
  medicationName: {
    ...typography.semiBold,
    color: colors.textPrimary,
    flexShrink: 1,
    fontSize: 19,
  },
  timeBadgeAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  timeBadgeAlertText: {
    ...typography.semiBold,
    color: colors.textPrimary,
    fontSize: 18,
  },
  medicationAlertDescription: {
    ...typography.medium,
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  timeBadgeMuted: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(22, 128, 140, 0.12)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  timeBadgeMutedText: {
    ...typography.medium,
    color: colors.primary,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  confirmAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 18,
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.warning,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
    marginTop: spacing.md,
    alignSelf: "stretch",
    width: "100%",
  },
  confirmAllText: {
    ...typography.semiBold,
    color: colors.textPrimary,
    fontSize: 17,
    letterSpacing: 0.4,
    textAlign: "center",
  },
  restockList: {
    gap: spacing.md,
  },
  restockRow: {
    borderRadius: 18,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.overlay,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  restockRowCritical: {
    backgroundColor: "rgba(166, 31, 67, 0.12)",
    borderColor: colors.danger,
  },
  restockRowWarning: {
    backgroundColor: "rgba(242, 195, 107, 0.18)",
    borderColor: colors.warning,
  },
  restockRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  restockName: {
    ...typography.semiBold,
    color: colors.textPrimary,
    fontSize: 18,
  },
  restockDetails: {
    ...typography.medium,
    color: colors.textSecondary,
    fontSize: 16,
  },
  restockLocationRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  restockLocationText: {
    ...typography.medium,
    color: colors.textSecondary,
    fontSize: 15,
  },
  restockSeverityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  restockSeverityText: {
    ...typography.medium,
    fontSize: 14,
  },
  restockActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    minHeight: 48,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    marginTop: spacing.sm,
  },
  restockActionText: {
    ...typography.semiBold,
    color: colors.primaryContrast,
    fontSize: 16,
    letterSpacing: 0.4,
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
