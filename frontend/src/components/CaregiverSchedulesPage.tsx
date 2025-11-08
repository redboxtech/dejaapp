// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useData } from "./DataContext";
import { apiFetch } from "@/lib/api";
import { WeeklyCalendar, WeeklyCalendarEvent } from "./WeeklyCalendar";
import { formatPhoneNumber, sanitizePhoneNumber } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Calendar,
  Clock,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

interface PatientInfo {
  patientId: string;
  patientName: string;
}

interface CaregiverSchedule {
  id: string;
  caregiverId: string;
  caregiverName: string;
  patients: PatientInfo[];
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  createdAt: string;
}

type EditingSchedule = CaregiverSchedule & {
  patientIds: string[];
};

interface Caregiver {
  id: string;
  name: string;
  email?: string;
  phone: string;
  patients: string[];
  color?: string;
}

interface SchedulePeriod {
  id: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  crossesMidnight: boolean;
}

const DAYS_OF_WEEK = [
  { value: "Segunda", label: "Segunda-feira" },
  { value: "Terça", label: "Terça-feira" },
  { value: "Quarta", label: "Quarta-feira" },
  { value: "Quinta", label: "Quinta-feira" },
  { value: "Sexta", label: "Sexta-feira" },
  { value: "Sábado", label: "Sábado" },
  { value: "Domingo", label: "Domingo" },
];

const NEW_SCHEDULE_INITIAL_STATE = {
  caregiverId: "",
  patientIds: [] as string[],
  periods: [] as SchedulePeriod[],
};

export function CaregiverSchedulesPage() {
  const { patients } = useData();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [schedules, setSchedules] = useState<CaregiverSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [editingSchedule, setEditingSchedule] =
    useState<EditingSchedule | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);

  const [newSchedule, setNewSchedule] = useState(NEW_SCHEDULE_INITIAL_STATE);
  const [expandedCaregivers, setExpandedCaregivers] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [caregiverResponse, scheduleResponse] = await Promise.all([
        apiFetch<Caregiver[]>(`/caregivers`),
        apiFetch<CaregiverSchedule[]>(`/caregiver-schedules`),
      ]);
      setCaregivers(
        (caregiverResponse || []).map((cg) => ({
          ...cg,
          phone: sanitizePhoneNumber(cg.phone),
        }))
      );
      setSchedules(scheduleResponse || []);
      console.info(
        "Dados carregados - Cuidadores:",
        caregiverResponse?.length ?? 0,
        "Escalas:",
        scheduleResponse?.length ?? 0
      );
    } catch (error) {
      console.error("Erro ao carregar escalas de cuidadores:", error);
      toast.error("Não foi possível carregar as escalas de cuidadores");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadData();
  };

  const addPeriod = () => {
    const newPeriod: SchedulePeriod = {
      id: Math.random().toString(36).slice(2),
      daysOfWeek: [],
      startTime: "",
      endTime: "",
      crossesMidnight: false,
    };
    setNewSchedule((prev) => ({
      ...prev,
      periods: [...prev.periods, newPeriod],
    }));
  };

  const removePeriod = (periodId: string) => {
    setNewSchedule((prev) => ({
      ...prev,
      periods: prev.periods.filter((period) => period.id !== periodId),
    }));
  };

  const updatePeriod = (periodId: string, updates: Partial<SchedulePeriod>) => {
    setNewSchedule((prev) => ({
      ...prev,
      periods: prev.periods.map((period) =>
        period.id === periodId ? { ...period, ...updates } : period
      ),
    }));
  };

  const togglePeriodDay = (
    periodId: string,
    day: string,
    isChecked: boolean
  ) => {
    const period = newSchedule.periods.find((p) => p.id === periodId);
    if (!period) return;
    const updatedDays = isChecked
      ? [...period.daysOfWeek, day]
      : period.daysOfWeek.filter((d) => d !== day);
    updatePeriod(periodId, { daysOfWeek: updatedDays });
  };

  const checkMidnightCross = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return false;
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return endMinutes <= startMinutes;
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.caregiverId || newSchedule.patientIds.length === 0) {
      toast.error("Selecione um cuidador e pelo menos um paciente");
      return;
    }

    if (newSchedule.periods.length === 0) {
      toast.error("Adicione ao menos um período à escala");
      return;
    }

    for (const period of newSchedule.periods) {
      if (period.daysOfWeek.length === 0) {
        toast.error("Cada período deve incluir ao menos um dia da semana");
        return;
      }
      if (!period.startTime || !period.endTime) {
        toast.error("Defina horário de início e término para cada período");
        return;
      }
    }

    try {
      const requests = newSchedule.periods.map((period) =>
        apiFetch(`/caregiver-schedules`, {
          method: "POST",
          body: JSON.stringify({
            caregiverId: newSchedule.caregiverId,
            patientIds: newSchedule.patientIds,
            daysOfWeek: period.daysOfWeek,
            startTime: period.startTime,
            endTime: period.endTime,
          }),
        })
      );

      const createdCount = newSchedule.periods.length;
      await Promise.all(requests);
      toast.success(
        `${createdCount} escala${createdCount > 1 ? "s" : ""} criada${
          createdCount > 1 ? "s" : ""
        } com sucesso`
      );

      setIsAddScheduleOpen(false);
      setNewSchedule(NEW_SCHEDULE_INITIAL_STATE);
      await loadData();
    } catch (error: any) {
      console.error("Erro ao criar escala:", error);
      toast.error(error?.message || "Erro ao criar escala");
    }
  };

  const openEditSchedule = (schedule: CaregiverSchedule) => {
    setEditingSchedule({
      ...schedule,
      patientIds: schedule.patients.map((patient) => patient.patientId),
    });
    setIsEditScheduleOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSchedule) return;
    if (
      !editingSchedule.caregiverId ||
      !editingSchedule.startTime ||
      !editingSchedule.endTime ||
      editingSchedule.patientIds.length === 0 ||
      editingSchedule.daysOfWeek.length === 0
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await apiFetch(`/caregiver-schedules/${editingSchedule.id}`, {
        method: "PUT",
        body: JSON.stringify({
          caregiverId: editingSchedule.caregiverId,
          patientIds: editingSchedule.patientIds,
          daysOfWeek: editingSchedule.daysOfWeek,
          startTime: editingSchedule.startTime,
          endTime: editingSchedule.endTime,
        }),
      });
      toast.success("Escala atualizada com sucesso");
      setIsEditScheduleOpen(false);
      setEditingSchedule(null);
      await loadData();
    } catch (error: any) {
      console.error("Erro ao atualizar escala:", error);
      toast.error(error?.message || "Erro ao atualizar escala");
    }
  };

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return;
    try {
      await apiFetch(`/caregiver-schedules/${scheduleToDelete}`, {
        method: "DELETE",
      });
      toast.success("Escala removida com sucesso");
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
      await loadData();
    } catch (error: any) {
      console.error("Erro ao remover escala:", error);
      toast.error(error?.message || "Erro ao remover escala");
    }
  };

  const calendarEvents: WeeklyCalendarEvent[] = useMemo(() => {
    if (!schedules.length) return [];

    return schedules.map((schedule) => {
      const caregiver = caregivers.find(
        (cg) => String(cg.id) === String(schedule.caregiverId)
      );
      const patientLabel =
        schedule.patients.length === 1
          ? schedule.patients[0].patientName
          : `${schedule.patients.length} pacientes`;

      return {
        id: schedule.id,
        title: schedule.caregiverName,
        subtitle: patientLabel,
        description: `Início ${schedule.startTime} • Fim ${schedule.endTime}`,
        daysOfWeek: schedule.daysOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        color: caregiver?.color || "#16808c",
        metadata: {
          scheduleId: schedule.id,
        },
      };
    });
  }, [schedules, caregivers]);

  const uniquePatientsCount = useMemo(() => {
    const ids = new Set<string>();
    schedules.forEach((schedule) => {
      schedule.patients.forEach((patient) => ids.add(patient.patientId));
    });
    return ids.size;
  }, [schedules]);

  const groupedSchedules = useMemo(() => {
    const map = new Map<
      string,
      { caregiver: Caregiver | undefined; schedules: CaregiverSchedule[] }
    >();

    schedules.forEach((schedule) => {
      const caregiverId = String(schedule.caregiverId);
      if (!map.has(caregiverId)) {
        map.set(caregiverId, {
          caregiver: caregivers.find(
            (cg) => String(cg.id) === caregiverId
          ),
          schedules: [],
        });
      }
      map.get(caregiverId)!.schedules.push(schedule);
    });

    return Array.from(map.entries())
      .map(([caregiverId, data]) => ({
        caregiverId,
        caregiver: data.caregiver,
        schedules: data.schedules.sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        ),
      }))
      .sort((a, b) =>
        (a.caregiver?.name || "").localeCompare(b.caregiver?.name || "")
      );
  }, [schedules, caregivers]);

  const handleEventClick = (event: WeeklyCalendarEvent) => {
    const scheduleId = event.metadata?.scheduleId as string | undefined;
    if (!scheduleId) return;
    const schedule = schedules.find((item) => item.id === scheduleId);
    if (schedule) {
      openEditSchedule(schedule);
    }
  };

  const formatDays = (days: string[]) => {
    const map: Record<string, string> = {
      Segunda: "Seg",
      Terça: "Ter",
      Quarta: "Qua",
      Quinta: "Qui",
      Sexta: "Sex",
      Sábado: "Sáb",
      Domingo: "Dom",
    };
    return days.map((day) => map[day] || day).join(", ");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Escala de Cuidadores
          </h1>
          <p className="text-gray-500 mt-1">
            Organize as escalas semanais por cuidador, horário e pacientes
            atendidos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isRefreshing}
            className="border-[#16808c] text-[#16808c] hover:bg-[#16808c]/10"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
          <Dialog
            open={isAddScheduleOpen}
            onOpenChange={(open) => {
              setIsAddScheduleOpen(open);
              if (!open) {
                setNewSchedule(NEW_SCHEDULE_INITIAL_STATE);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-[#16808c] hover:bg-[#0f6069]">
                <Plus className="h-4 w-4 mr-2" />
                Nova escala
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-[#16808c] text-2xl font-bold">
                  <Calendar className="h-6 w-6" />
                  Criar escala de cuidador
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600">
                  Escolha o cuidador, vincule pacientes e defina um ou mais
                  períodos de trabalho.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label>Cuidador *</Label>
                  <Select
                    value={newSchedule.caregiverId}
                    onValueChange={(value) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        caregiverId: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cuidador" />
                    </SelectTrigger>
                    <SelectContent>
                      {caregivers.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          Nenhum cuidador cadastrado.
                        </div>
                      ) : (
                        caregivers.map((caregiver) => (
                          <SelectItem
                            key={String(caregiver.id)}
                            value={String(caregiver.id)}
                          >
                            {caregiver.name}
                            {caregiver.phone ? ` • ${formatPhoneNumber(caregiver.phone)}` : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Pacientes *</Label>
                  <div className="mt-2 border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                    {patients.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Nenhum paciente cadastrado.
                      </p>
                    ) : (
                      patients.map((patient) => {
                        const isSelected = newSchedule.patientIds.includes(
                          patient.id
                        );
                        return (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() =>
                              setNewSchedule((prev) => ({
                                ...prev,
                                patientIds: isSelected
                                  ? prev.patientIds.filter(
                                      (id) => id !== patient.id
                                    )
                                  : [...prev.patientIds, patient.id],
                              }))
                            }
                            className={`w-full text-left p-2 rounded border transition-colors ${
                              isSelected
                                ? "border-[#16808c] bg-[#16808c]/10"
                                : "border-transparent hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <Checkbox
                                checked={isSelected}
                                onChange={() => {}}
                                onClick={(e) => e.stopPropagation()}
                                className="mt-1 rounded border-gray-300 cursor-pointer"
                              />
                              <div>
                                <div className="font-medium text-sm">
                                  {patient.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {patient.age} anos • {patient.careType}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                  {newSchedule.patientIds.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {newSchedule.patientIds.length} paciente
                      {newSchedule.patientIds.length > 1 ? "s" : ""} selecionado
                      {newSchedule.patientIds.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      Períodos de trabalho *
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addPeriod}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar período
                    </Button>
                  </div>

                  {newSchedule.periods.length === 0 && (
                    <div className="border border-dashed border-gray-300 rounded-lg py-8 text-center text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p>Nenhum período adicionado ainda.</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Clique em “Adicionar período” para configurar horários.
                      </p>
                    </div>
                  )}

                  {newSchedule.periods.map((period, index) => (
                    <Card key={period.id} className="border-2">
                      <CardHeader className="pb-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#16808c] text-white flex items-center justify-center font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <CardTitle className="text-[#16808c] text-base">
                              Período {index + 1}
                            </CardTitle>
                            <CardDescription>
                              Defina dias e horários de atuação
                            </CardDescription>
                          </div>
                        </div>
                        {newSchedule.periods.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:bg-red-50"
                            onClick={() => removePeriod(period.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Dias da semana *</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                            {DAYS_OF_WEEK.map((day) => (
                              <label
                                key={day.value}
                                className={`flex items-center gap-2 rounded border p-2 cursor-pointer text-sm transition-colors ${
                                  period.daysOfWeek.includes(day.value)
                                    ? "border-[#16808c] bg-[#16808c]/10 font-medium"
                                    : "border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                <Checkbox
                                  checked={period.daysOfWeek.includes(
                                    day.value
                                  )}
                                  onCheckedChange={(checked) =>
                                    togglePeriodDay(
                                      period.id,
                                      day.value,
                                      Boolean(checked)
                                    )
                                  }
                                />
                                {day.label}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Horário de início *</Label>
                            <Input
                              type="time"
                              value={period.startTime}
                              onChange={(event) => {
                                const value = event.target.value;
                                updatePeriod(period.id, {
                                  startTime: value,
                                  crossesMidnight: checkMidnightCross(
                                    value,
                                    period.endTime
                                  ),
                                });
                              }}
                            />
                          </div>
                          <div>
                            <Label>Horário de término *</Label>
                            <Input
                              type="time"
                              value={period.endTime}
                              onChange={(event) => {
                                const value = event.target.value;
                                updatePeriod(period.id, {
                                  endTime: value,
                                  crossesMidnight: checkMidnightCross(
                                    period.startTime,
                                    value
                                  ),
                                });
                              }}
                            />
                            {period.crossesMidnight && (
                              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Este período atravessa a meia-noite e continua
                                no dia seguinte.
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddScheduleOpen(false);
                    setNewSchedule(NEW_SCHEDULE_INITIAL_STATE);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddSchedule}
                  className="bg-[#16808c] hover:bg-[#0f6069]"
                  disabled={newSchedule.periods.length === 0}
                >
                  Criar escala
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Cuidadores ativos
              </p>
              <p className="text-3xl font-bold text-[#16808c] mt-2">
                {caregivers.length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#16808c]/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-[#16808c]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Pacientes atendidos
              </p>
              <p className="text-3xl font-bold text-[#16808c] mt-2">
                {uniquePatientsCount}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#16808c]/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-[#16808c]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden border border-gray-200 shadow-sm bg-white">
        <CardHeader className="bg-[#f5fbfc] border-b border-gray-200 px-6 pt-6 pb-4">
          <CardTitle className="flex items-center gap-2 text-[#16808c]">
            <Calendar className="h-5 w-5" />
            Calendário semanal
          </CardTitle>
          <CardDescription>
            Visualize as escalas distribuídas por dia da semana e faixas de horário.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="h-6 w-6 mr-2 animate-spin" />
              Carregando calendário...
            </div>
          ) : calendarEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Calendar className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">
                Nenhuma escala cadastrada até o momento.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Utilize o botão “Nova escala” para começar.
              </p>
            </div>
          ) : (
            <WeeklyCalendar
              className="border border-gray-100 rounded-lg shadow-sm"
              events={calendarEvents}
              onEventClick={handleEventClick}
              renderEventContent={(event) => (
                <div className="flex flex-col gap-0.5">
                  <div className="text-[10px] font-semibold truncate">
                    {event.title}
                  </div>
                  <div className="text-[9px] opacity-80">
                    {event.startTime} - {event.endTime}
                  </div>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <section className="mt-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Lista de escalas
          </h2>
          <span className="text-sm text-gray-500">
            {groupedSchedules.length} cuidador
            {groupedSchedules.length === 1 ? "" : "es"} com escalas registradas
          </span>
        </div>

        {isLoading ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-3" />
            Carregando histórico...
          </div>
        ) : groupedSchedules.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500 bg-white">
            Nenhum histórico de escalas cadastrado até o momento.
          </div>
        ) : (
          groupedSchedules.map((group) => {
            const caregiverName =
              group.caregiver?.name ||
              group.schedules[0]?.caregiverName ||
              "Cuidador sem nome";
            const badgeLabel =
              group.schedules.length === 1
                ? "1 escala"
                : `${group.schedules.length} escalas`;
            const isOpen =
              expandedCaregivers[group.caregiverId] ?? false;
            const color = group.caregiver?.color || "#16808c";

            return (
              <div
                key={group.caregiverId}
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white"
              >
                <button
                  type="button"
                  className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setExpandedCaregivers((prev) => ({
                      ...prev,
                      [group.caregiverId]: !(prev[group.caregiverId] ?? false),
                    }))
                  }
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-[#16808c]/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#16808c]" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 flex-1 min-w-0">
                      <span className="font-medium text-gray-900 truncate">
                        {caregiverName}
                      </span>
                      <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium text-gray-700 whitespace-nowrap">
                        {badgeLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <div className="hover:bg-gray-100 p-1.5 rounded transition-colors">
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="bg-gray-50 border-t border-gray-200">
                    <div className="divide-y divide-gray-200">
                      {group.schedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">
                              {formatDays(schedule.daysOfWeek)}
                            </p>
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                              {schedule.startTime} • {schedule.endTime}
                            </p>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {schedule.patients.map((patient) => (
                                <Badge
                                  key={patient.patientId}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {patient.patientName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditSchedule(schedule)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-200 hover:bg-red-50"
                              onClick={() => {
                                setScheduleToDelete(schedule.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              Excluir
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      <Dialog
        open={isEditScheduleOpen}
        onOpenChange={(open) => {
          setIsEditScheduleOpen(open);
          if (!open) setEditingSchedule(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#16808c] text-2xl font-bold">
              Editar escala
            </DialogTitle>
            <DialogDescription>
              Ajuste horários, pacientes ou dias da semana.
            </DialogDescription>
          </DialogHeader>
          {editingSchedule && (
            <div className="space-y-4">
              <div>
                <Label>Cuidador *</Label>
                <Select
                  value={editingSchedule.caregiverId}
                  onValueChange={(value) =>
                    setEditingSchedule((prev) =>
                      prev
                        ? {
                            ...prev,
                            caregiverId: value,
                            caregiverName:
                              caregivers.find((cg) => String(cg.id) === value)
                                ?.name || prev.caregiverName,
                          }
                        : prev
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cuidador" />
                  </SelectTrigger>
                  <SelectContent>
                    {caregivers.map((caregiver) => (
                      <SelectItem
                        key={String(caregiver.id)}
                        value={String(caregiver.id)}
                      >
                        {caregiver.name}
                        {caregiver.phone ? ` • ${formatPhoneNumber(caregiver.phone)}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Pacientes *</Label>
                <div className="mt-2 border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                  {patients.map((patient) => {
                    const isSelected = editingSchedule.patientIds.includes(
                      patient.id
                    );
                    return (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() =>
                          setEditingSchedule((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  patientIds: isSelected
                                    ? prev.patientIds.filter(
                                        (id) => id !== patient.id
                                      )
                                    : [...prev.patientIds, patient.id],
                                }
                              : prev
                          )
                        }
                        className={`w-full text-left p-2 rounded border transition-colors ${
                          isSelected
                            ? "border-[#16808c] bg-[#16808c]/10"
                            : "border-transparent hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => {}}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 rounded border-gray-300 cursor-pointer"
                          />
                          <div>
                            <div className="font-medium text-sm">
                              {patient.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {patient.age} anos • {patient.careType}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {editingSchedule.patientIds.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {editingSchedule.patientIds.length} paciente
                    {editingSchedule.patientIds.length > 1 ? "s" : ""}{" "}
                    selecionado
                    {editingSchedule.patientIds.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <div>
                <Label>Dias da semana *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                  {DAYS_OF_WEEK.map((day) => (
                    <label
                      key={day.value}
                      className={`flex items-center gap-2 rounded border p-2 cursor-pointer text-sm transition-colors ${
                        editingSchedule.daysOfWeek.includes(day.value)
                          ? "border-[#16808c] bg-[#16808c]/10 font-medium"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <Checkbox
                        checked={editingSchedule.daysOfWeek.includes(day.value)}
                        onCheckedChange={(checked) =>
                          setEditingSchedule((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  daysOfWeek: checked
                                    ? [...prev.daysOfWeek, day.value]
                                    : prev.daysOfWeek.filter(
                                        (d) => d !== day.value
                                      ),
                                }
                              : prev
                          )
                        }
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Horário de início *</Label>
                  <Input
                    type="time"
                    value={editingSchedule.startTime}
                    onChange={(event) =>
                      setEditingSchedule((prev) =>
                        prev
                          ? { ...prev, startTime: event.target.value }
                          : prev
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Horário de término *</Label>
                  <Input
                    type="time"
                    value={editingSchedule.endTime}
                    onChange={(event) =>
                      setEditingSchedule((prev) =>
                        prev
                          ? { ...prev, endTime: event.target.value }
                          : prev
                      )
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {editingSchedule && (
              <Button
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => {
                  setIsEditScheduleOpen(false);
                  setScheduleToDelete(editingSchedule.id);
                  setDeleteDialogOpen(true);
                }}
              >
                Excluir escala
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsEditScheduleOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-[#16808c] hover:bg-[#0f6069]"
            >
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover escala</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A escala será removida
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setScheduleToDelete(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
              >
                Excluir
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


