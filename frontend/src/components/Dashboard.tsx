import React, { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Users,
  Pill,
  AlertTriangle,
  Clock,
  AlertCircle,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useData } from "./DataContext";
import { apiFetch } from "../lib/api";

interface DashboardProps {
  onNavigate: (page: string, id?: string) => void;
}

interface CaregiverSchedule {
  id: string;
  caregiverId: string;
  caregiverName: string;
  patientId: string;
  patientName: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  createdAt: string;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const {
    patients,
    medications,
    stockItems,
    replenishmentRequests,
    monthlyExpenses,
  } = useData();
  const [schedules, setSchedules] = useState<CaregiverSchedule[]>([]);
  const [expandedPatients, setExpandedPatients] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const schedulesData = await apiFetch<CaregiverSchedule[]>(
          `/caregiver-schedules`
        );
        setSchedules(schedulesData || []);
      } catch (error) {
        console.error("Erro ao carregar escalas:", error);
      }
    };
    loadSchedules();
  }, []);

  const getCaregiverForPatientAndTime = (
    patientId: string,
    time: string
  ): string | null => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda, etc.

    const dayNames = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];
    const currentDayName = dayNames[dayOfWeek];

    // Parse time (HH:mm format)
    const [hours, minutes] = time.split(":").map(Number);
    const medicationTime = hours * 60 + minutes;

    // Encontrar todas as escalas do paciente para o dia atual
    const matchingSchedules = schedules.filter(
      (s) => s.patientId === patientId && s.daysOfWeek.includes(currentDayName)
    );

    if (matchingSchedules.length === 0) return null;

    // Verificar cada escala para ver se o horário está dentro do período
    for (const schedule of matchingSchedules) {
      const [startHours, startMinutes] = schedule.startTime
        .split(":")
        .map(Number);
      const [endHours, endMinutes] = schedule.endTime.split(":").map(Number);
      const startTime = startHours * 60 + startMinutes;
      const endTime = endHours * 60 + endMinutes;

      // Verificar se o período atravessa meia-noite (endTime <= startTime)
      const crossesMidnight = endTime <= startTime;

      if (crossesMidnight) {
        // Período noturno: 19:00 às 08:00 significa de 19:00 até 23:59 OU de 00:00 até 08:00
        if (medicationTime >= startTime || medicationTime <= endTime) {
          return schedule.caregiverName;
        }
      } else {
        // Período normal: 08:00 às 15:00
        if (medicationTime >= startTime && medicationTime <= endTime) {
          return schedule.caregiverName;
        }
      }
    }

    return null;
  };

  // Memoized computations para performance
  const {
    morningMeds,
    afternoonMeds,
    nightMeds,
    visibleSectionTitle,
    visibleItems,
  } = useMemo(() => {
    const parseHour = (t: string) => {
      const [h] = t.split(":");
      const n = parseInt(h || "0", 10);
      return isNaN(n) ? 0 : n;
    };
    const parseMinutes = (t: string) => {
      const [h, m] = t.split(":");
      const hh = parseInt(h || "0", 10);
      const mm = parseInt(m || "0", 10);
      return (isNaN(hh) ? 0 : hh) * 60 + (isNaN(mm) ? 0 : mm);
    };
    const all = medications
      .flatMap((med) =>
        med.times.map((time) => ({
          patient: med.patient,

          patientId: med.patientId,

          medication: `${med.name} ${med.dosage}${
            med.unit === "comprimido" ? "mg" : med.unit
          }`,
          time,
          status: "pending" as const,
        }))
      )
      .sort((a, b) => a.time.localeCompare(b.time));

    const morning = all.filter((m) => {
      const h = parseHour(m.time);
      return h >= 5 && h < 12;
    });
    const afternoon = all.filter((m) => {
      const h = parseHour(m.time);
      return h >= 12 && h < 18;
    });
    const night = all.filter((m) => {
      const h = parseHour(m.time);
      return h >= 18 || h < 5;
    });
    // Seleção de exibição: pendentes do período atual OU todas do próximo período
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    let currentTitle = "";
    let items: typeof all = [];

    const currentPeriod =
      now.getHours() >= 5 && now.getHours() < 12
        ? "morning"
        : now.getHours() >= 12 && now.getHours() < 18
        ? "afternoon"
        : "night";

    const periodToItems = {
      morning,
      afternoon,
      night,
    } as const;

    const nextOf = (p: "morning" | "afternoon" | "night") =>
      p === "morning" ? "afternoon" : p === "afternoon" ? "night" : "morning";

    const titleMap = {
      morning: "Manhã",
      afternoon: "Tarde",
      night: "Noite",
    } as const;

    const currentList = periodToItems[currentPeriod];
    const pendingInCurrent = currentList.filter(
      (m) => parseMinutes(m.time) >= nowMinutes
    );
    if (pendingInCurrent.length > 0) {
      currentTitle = titleMap[currentPeriod];
      items = pendingInCurrent;
    } else {
      const nextPeriod = nextOf(currentPeriod);

      // Se estamos na noite e não há mais medicações pendentes, mostrar manhã do dia seguinte
      if (currentPeriod === "night") {
        currentTitle = "Manhã (Próximo Dia)";
        items = periodToItems["morning"];
      } else {
        currentTitle = titleMap[nextPeriod];
        items = periodToItems[nextPeriod];
      }
    }

    return {
      morningMeds: morning,
      afternoonMeds: afternoon,
      nightMeds: night,
      visibleSectionTitle: currentTitle,
      visibleItems: items,
    };
  }, [medications, patients]);

  const criticalStocks = useMemo(() => {
    return stockItems
      .filter((s) => s.status === "critical" || s.status === "warning")
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 3);
  }, [stockItems]);

  const getUnitLabel = (unit: string) => {
    const labels: Record<string, string> = {
      comprimido: "comp",
      capsula: "caps",
      ml: "ml",
      gotas: "gts",
      mg: "mg",
      g: "g",
      aplicacao: "apl",
      inalacao: "inal",
      ampola: "amp",
      xarope: "xar",
      suspensao: "susp",
    };
    return labels[unit] || unit;
  };

  // TODO: Implementar quando tiver dados de receitas disponíveis
  // As receitas vencendo serão buscadas diretamente da entidade Prescription
  const expiringPrescriptions = useMemo(() => {
    // Por enquanto retornar array vazio, será implementado quando tiver receitas
    return [];
  }, [medications]);

  const stats = useMemo(
    () => ({
      totalPatients: patients.length,
      totalMedications: medications.length,
      criticalAlerts: stockItems.filter((s) => s.status === "critical").length,
      pendingRequests: replenishmentRequests.filter(
        (r) => r.status === "pending"
      ).length,
    }),
    [patients, medications, stockItems, replenishmentRequests]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#16808c]">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Visão geral do gerenciamento de cuidados
        </p>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-row gap-3 w-full">
        <Card className="p-4 flex-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3 px-0 pt-0">
            <CardTitle className="text-base font-medium text-[#16808c]">
              Pacientes
            </CardTitle>
            <Users className="h-5 w-5 text-[#16808c]" />
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-1">
            <div className="text-xl font-bold text-[#16808c]">
              {stats.totalPatients}
            </div>
            <p className="text-xs text-gray-500 mt-1">Ativos</p>
          </CardContent>
        </Card>

        <Card className="p-4 flex-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3 px-0 pt-0">
            <CardTitle className="text-base font-medium text-[#16808c]">
              Medicamentos
            </CardTitle>
            <Pill className="h-5 w-5 text-[#6cced9]" />
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-1">
            <div className="text-xl font-bold text-[#16808c]">
              {stats.totalMedications}
            </div>
            <p className="text-xs text-gray-500 mt-1">Ativos</p>
          </CardContent>
        </Card>

        <Card className="p-4 flex-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3 px-0 pt-0">
            <CardTitle className="text-base font-medium text-[#a61f43]">
              Críticos
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-[#a61f43]" />
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-1">
            <div className="text-xl font-bold text-[#a61f43]">
              {stats.criticalAlerts}
            </div>
            <p className="text-xs text-gray-500 mt-1">Estoques</p>
          </CardContent>
        </Card>

        <Card className="p-4 flex-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3 px-0 pt-0">
            <CardTitle className="text-base font-medium text-[#16808c]">
              Solicitações
            </CardTitle>
            <Clock className="h-5 w-5 text-[#a0bf80]" />
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-1">
            <div className="text-xl font-bold text-[#16808c]">
              {stats.pendingRequests}
            </div>
            <p className="text-xs text-gray-500 mt-1">Pendentes</p>
          </CardContent>
        </Card>

        <Card className="p-4 flex-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3 px-0 pt-0">
            <CardTitle className="text-base font-medium text-[#16808c]">
              Gasto Mensal
            </CardTitle>
            <DollarSign className="h-5 w-5 text-[#a0bf80]" />
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-1">
            <div className="text-lg font-bold text-[#16808c]">
              R${" "}
              {monthlyExpenses.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Este mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Patients Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-[#16808c]">Meus Pacientes</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate("patients")}
              >
                Ver Todos
              </Button>
            </CardTitle>
            <CardDescription>
              Pacientes sob sua responsabilidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {patients.slice(0, 3).map((patient) => (
              <div
                key={patient.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onNavigate("patients", patient.id)}
              >
                <Avatar>
                  <AvatarFallback className="bg-[#6cced9] text-white">
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-sm text-gray-500">
                    {patient.age} anos • {patient.medications} medicamentos
                  </div>
                </div>
                {patient.criticalAlerts > 0 && (
                  <Badge variant="destructive" className="bg-[#a61f43]">
                    {patient.criticalAlerts}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-[#16808c]">Próximas Medicações</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate("medications")}
              >
                Ver Todas
              </Button>
            </CardTitle>
            <CardDescription>Horários de administração de hoje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs uppercase text-gray-500 mb-2">
              {visibleSectionTitle}
            </div>
            {visibleItems.length === 0 ? (
              <div className="text-sm text-gray-400">
                Sem horários neste período
              </div>
            ) : (
              <div className="space-y-3">
                {(() => {
                  // Agrupar medicações por paciente
                  const groupedByPatient = visibleItems.reduce((acc, med) => {
                    if (!acc[med.patientId]) {
                      // Buscar nome do paciente na lista de pacientes se med.patient estiver vazio
                      const patient = patients.find(
                        (p) => p.id === med.patientId
                      );
                      const patientName =
                        med.patient || patient?.name || "Paciente desconhecido";

                      acc[med.patientId] = {
                        patientId: med.patientId,
                        patientName: patientName,
                        medications: [],
                        caregiver: null as string | null,
                      };
                    }
                    acc[med.patientId].medications.push(med);

                    // Buscar cuidador responsável para este horário
                    const caregiver = getCaregiverForPatientAndTime(
                      med.patientId,
                      med.time
                    );
                    if (caregiver && !acc[med.patientId].caregiver) {
                      acc[med.patientId].caregiver = caregiver;
                    }

                    return acc;
                  }, {} as Record<string, { patientId: string; patientName: string; medications: typeof visibleItems; caregiver: string | null }>);

                  const patientGroups = Object.values(groupedByPatient);

                  return patientGroups.map((group) => (
                    <div
                      key={group.patientId}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="w-full p-3 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3 flex-1">
                          <Users className="h-5 w-5 text-[#16808c] flex-shrink-0" />
                          <span className="font-medium text-gray-900">
                            {group.patientName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {group.medications.length}{" "}
                            {group.medications.length === 1
                              ? "medicação"
                              : "medicações"}
                          </Badge>
                          {group.caregiver && (
                            <span className="text-xs text-gray-500 ml-2">
                              Cuidador: {group.caregiver}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedPatients);
                              if (newExpanded.has(group.patientId)) {
                                newExpanded.delete(group.patientId);
                              } else {
                                newExpanded.add(group.patientId);
                              }
                              setExpandedPatients(newExpanded);
                            }}
                            className="hover:bg-gray-50 p-1 rounded transition-colors"
                          >
                            {expandedPatients.has(group.patientId) ? (
                              <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {expandedPatients.has(group.patientId) && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          <div className="p-3 space-y-2">
                            {group.medications.map((med, idx) => (
                              <div
                                key={`${group.patientId}-${idx}`}
                                className="flex items-center gap-3 p-2 rounded bg-white"
                              >
                                <Clock className="h-4 w-4 text-[#16808c] flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium">
                                    {med.medication}
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-[#16808c]">
                                  {med.time}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Critical Stock Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#a61f43]" />
              <span className="text-[#16808c]">Estoques Críticos</span>
            </CardTitle>
            <CardDescription>Medicamentos com estoque baixo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {criticalStocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Todos os estoques estão normais
              </div>
            ) : (
              <>
                {criticalStocks.map((stock) => (
                  <div
                    key={stock.id}
                    className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="font-semibold text-base text-gray-900">
                        {stock.medication}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Estoque Atual
                          </div>
                          <div className="text-sm font-bold text-[#16808c]">
                            {stock.current}{" "}
                            {getUnitLabel(
                              stock.presentationForm ||
                                stock.unit ||
                                "comprimido"
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Dias Restantes
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-bold text-gray-900">
                              {stock.daysLeft} dias
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                stock.status === "critical"
                                  ? "text-[#a61f43] border-[#a61f43] bg-[#a61f43]/10"
                                  : "text-[#f2c36b] border-[#f2c36b] bg-[#f2c36b]/10"
                              }
                            >
                              {stock.status === "critical"
                                ? "Crítico"
                                : "Atenção"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-[#16808c] text-[#16808c] hover:bg-[#16808c]/10"
                  onClick={() => onNavigate("stock")}
                >
                  Ver Todos os Estoques
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Expiring Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#a61f43]" />
              <span className="text-[#16808c]">Receitas Vencendo</span>
            </CardTitle>
            <CardDescription>
              Receitas que precisam ser renovadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {expiringPrescriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma receita vencendo nos próximos 30 dias
              </div>
            ) : (
              <>
                {expiringPrescriptions.map((prescription, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border-2 border-[#a61f43]/20 bg-[#a61f43]/5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium">
                          {prescription.medication}
                        </div>
                        <div className="text-sm text-gray-500">
                          {prescription.patient}
                        </div>
                      </div>
                      <Badge className="bg-[#a61f43] text-white">
                        Tipo {prescription.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-[#a61f43]" />
                      <span className="text-[#a61f43] font-medium">
                        Vence em {prescription.expiresIn} dias
                      </span>
                    </div>
                  </div>
                ))}
                <Button
                  className="w-full bg-[#16808c] hover:bg-[#16808c]/90"
                  onClick={() => onNavigate("alerts")}
                >
                  Configurar Alertas
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
