import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  User,
  Users,
  UserPlus,
  Search,
  X,
  Mail,
  Phone
} from "lucide-react";
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
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner@2.0.3";
import { useData } from "./DataContext";
import { apiFetch } from "@/lib/api";

interface PatientInfo {
  patientId: string;
  patientName: string;
}

interface CaregiverSchedule {
  id: string;
  caregiverId: string;
  caregiverName: string;
  patients: PatientInfo[]; // Mudado de patientId/patientName para lista de pacientes
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  createdAt: string;
}

interface Caregiver {
  id: string;
  name: string;
  email?: string;
  phone: string;
  patients: string[];
}

export function CaregiverSchedulesPage() {
  const { patients } = useData();
  
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<CaregiverSchedule | null>(null);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [schedules, setSchedules] = useState<CaregiverSchedule[]>([]);
  
  // Estados para cadastro de cuidador
  const [isAddCaregiverOpen, setIsAddCaregiverOpen] = useState(false);
  const [isEditCaregiverOpen, setIsEditCaregiverOpen] = useState(false);
  const [editingCaregiver, setEditingCaregiver] = useState<Caregiver | null>(null);
  const [isDeleteCaregiverOpen, setIsDeleteCaregiverOpen] = useState(false);
  const [caregiverToDelete, setCaregiverToDelete] = useState<string | null>(null);
  const [newCaregiver, setNewCaregiver] = useState({
    name: "",
    email: "",
    phone: "",
    patients: [] as string[]
  });
  const [patientSearchTerm, setPatientSearchTerm] = useState("");

  // Interface para um período de escala
  interface SchedulePeriod {
    id: string; // ID temporário para controle interno
    daysOfWeek: string[];
    startTime: string;
    endTime: string;
    crossesMidnight: boolean; // Indica se o período atravessa meia-noite
  }

  const [newSchedule, setNewSchedule] = useState({
    caregiverId: "",
    patientIds: [] as string[], // Mudado de patientId para patientIds (array)
    periods: [] as SchedulePeriod[]
  });

  const daysOfWeekOptions = [
    { value: "Segunda", label: "Segunda-feira" },
    { value: "Terça", label: "Terça-feira" },
    { value: "Quarta", label: "Quarta-feira" },
    { value: "Quinta", label: "Quinta-feira" },
    { value: "Sexta", label: "Sexta-feira" },
    { value: "Sábado", label: "Sábado" },
    { value: "Domingo", label: "Domingo" }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cgs, schs] = await Promise.all([
        apiFetch<Caregiver[]>(`/caregivers`),
        apiFetch<CaregiverSchedule[]>(`/caregiver-schedules`)
      ]);
      setCaregivers(cgs || []);
      setSchedules(schs || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar escalas de cuidadores");
    }
  };

  // Adicionar novo período
  const addPeriod = () => {
    const newPeriod: SchedulePeriod = {
      id: Date.now().toString(),
      daysOfWeek: [],
      startTime: "",
      endTime: "",
      crossesMidnight: false
    };
    setNewSchedule({
      ...newSchedule,
      periods: [...newSchedule.periods, newPeriod]
    });
  };

  // Remover período
  const removePeriod = (periodId: string) => {
    setNewSchedule({
      ...newSchedule,
      periods: newSchedule.periods.filter(p => p.id !== periodId)
    });
  };

  // Atualizar período
  const updatePeriod = (periodId: string, updates: Partial<SchedulePeriod>) => {
    setNewSchedule({
      ...newSchedule,
      periods: newSchedule.periods.map(p => 
        p.id === periodId ? { ...p, ...updates } : p
      )
    });
  };

  // Toggle dia da semana em um período específico
  const handleDayToggle = (periodId: string, day: string, isChecked: boolean) => {
    const period = newSchedule.periods.find(p => p.id === periodId);
    if (!period) return;

    const updatedDays = isChecked
      ? [...period.daysOfWeek, day]
      : period.daysOfWeek.filter(d => d !== day);

    updatePeriod(periodId, { daysOfWeek: updatedDays });
  };

  // Verificar se período atravessa meia-noite
  const checkMidnightCross = (startTime: string, endTime: string): boolean => {
    if (!startTime || !endTime) return false;
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return endMinutes <= startMinutes; // Se endTime <= startTime, atravessa meia-noite
  };

  const handleEditDayToggle = (day: string, isChecked: boolean) => {
    if (!editingSchedule) return;
    
    if (isChecked) {
      setEditingSchedule({
        ...editingSchedule,
        daysOfWeek: [...editingSchedule.daysOfWeek, day]
      });
    } else {
      setEditingSchedule({
        ...editingSchedule,
        daysOfWeek: editingSchedule.daysOfWeek.filter(d => d !== day)
      });
    }
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.caregiverId || newSchedule.patientIds.length === 0) {
      toast.error("Selecione o cuidador e pelo menos um paciente");
      return;
    }

    if (newSchedule.periods.length === 0) {
      toast.error("Adicione pelo menos um período");
      return;
    }

    // Validar todos os períodos
    for (const period of newSchedule.periods) {
      if (period.daysOfWeek.length === 0) {
        toast.error("Cada período deve ter pelo menos um dia da semana");
        return;
      }
      if (!period.startTime || !period.endTime) {
        toast.error("Cada período deve ter horário de início e fim");
        return;
      }
    }

    try {
      // Criar uma escala para cada período (cada período pode ter múltiplos pacientes)
      const promises = newSchedule.periods.map(period => 
        apiFetch(`/caregiver-schedules`, {
          method: "POST",
          body: JSON.stringify({
            caregiverId: newSchedule.caregiverId,
            patientIds: newSchedule.patientIds, // Enviar array de patientIds
            daysOfWeek: period.daysOfWeek,
            startTime: period.startTime,
            endTime: period.endTime
          })
        })
      );

      await Promise.all(promises);
      toast.success(`${newSchedule.periods.length} escala(s) criada(s) com sucesso!`);
      setIsAddScheduleOpen(false);
      setNewSchedule({
        caregiverId: "",
        patientIds: [],
        periods: []
      });
      await loadData();
    } catch (error: any) {
      console.error("Erro ao criar escala:", error);
      toast.error(error?.message || "Erro ao criar escala");
    }
  };

  const handleEditClick = (schedule: CaregiverSchedule) => {
    // Converter patients para patientIds
    setEditingSchedule({
      ...schedule,
      patientIds: schedule.patients.map(p => p.patientId)
    });
    setIsEditScheduleOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSchedule) return;
    
    if (!editingSchedule.caregiverId || !editingSchedule.patientIds || editingSchedule.patientIds.length === 0 || 
        editingSchedule.daysOfWeek.length === 0 || 
        !editingSchedule.startTime || !editingSchedule.endTime) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await apiFetch(`/caregiver-schedules/${editingSchedule.id}`, {
        method: "PUT",
        body: JSON.stringify({
          caregiverId: editingSchedule.caregiverId,
          patientIds: editingSchedule.patientIds, // Enviar array de patientIds
          daysOfWeek: editingSchedule.daysOfWeek,
          startTime: editingSchedule.startTime,
          endTime: editingSchedule.endTime
        })
      });
      toast.success("Escala atualizada com sucesso!");
      setIsEditScheduleOpen(false);
      setEditingSchedule(null);
      await loadData();
    } catch (error: any) {
      console.error("Erro ao atualizar escala:", error);
      toast.error(error?.message || "Erro ao atualizar escala");
    }
  };

  const handleDeleteClick = (scheduleId: string) => {
    setScheduleToDelete(scheduleId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      await apiFetch(`/caregiver-schedules/${scheduleToDelete}`, {
        method: "DELETE"
      });
      toast.success("Escala excluída com sucesso!");
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
      await loadData();
    } catch (error: any) {
      console.error("Erro ao excluir escala:", error);
      toast.error(error?.message || "Erro ao excluir escala");
    }
  };

  const getPatientNames = (patientInfos: PatientInfo[]) => {
    if (!patientInfos || patientInfos.length === 0) return "Nenhum paciente";
    if (patientInfos.length === 1) return patientInfos[0].patientName;
    return `${patientInfos.length} pacientes: ${patientInfos.map(p => p.patientName).join(", ")}`;
  };

  const formatDays = (days: string[]) => {
    const dayMap: Record<string, string> = {
      "Segunda": "Seg",
      "Terça": "Ter",
      "Quarta": "Qua",
      "Quinta": "Qui",
      "Sexta": "Sex",
      "Sábado": "Sáb",
      "Domingo": "Dom"
    };
    return days.map(d => dayMap[d] || d).join(", ");
  };

  const handleAddCaregiver = async () => {
    if (!newCaregiver.name || !newCaregiver.phone) {
      toast.error("Preencha os campos obrigatórios (Nome e Telefone)");
      return;
    }
    try {
      await apiFetch(`/caregivers`, {
        method: 'POST',
        body: JSON.stringify({
          name: newCaregiver.name,
          email: newCaregiver.email || undefined,
          phone: newCaregiver.phone,
          patients: newCaregiver.patients,
        }),
      });
      await loadData(); // Recarregar dados para incluir o novo cuidador
      toast.success("Cuidador adicionado com sucesso!");
      setIsAddCaregiverOpen(false);
      setNewCaregiver({ name: "", email: "", phone: "", patients: [] });
      setPatientSearchTerm("");
    } catch (e: any) {
      console.error("Erro ao adicionar cuidador:", e);
      toast.error(e?.message || "Erro ao adicionar cuidador");
    }
  };

  const handleDeleteCaregiver = async () => {
    if (!caregiverToDelete) return;
    try {
      await apiFetch(`/caregivers/${caregiverToDelete}`, { method: 'DELETE' });
      await loadData();
      toast.success("Cuidador removido com sucesso");
      setIsDeleteCaregiverOpen(false);
      setCaregiverToDelete(null);
    } catch (e: any) {
      console.error("Erro ao excluir cuidador:", e);
      toast.error(e?.message || "Erro ao excluir cuidador");
    }
  };

  const handleEditCaregiverClick = (caregiver: Caregiver) => {
    setEditingCaregiver({
      ...caregiver,
      patients: [...caregiver.patients]
    });
    setIsEditCaregiverOpen(true);
  };

  const handleSaveEditCaregiver = async () => {
    if (!editingCaregiver || !editingCaregiver.name || !editingCaregiver.phone) {
      toast.error("Preencha os campos obrigatórios (Nome e Telefone)");
      return;
    }
    try {
      await apiFetch(`/caregivers/${editingCaregiver.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editingCaregiver.name,
          email: editingCaregiver.email || undefined,
          phone: editingCaregiver.phone,
          patients: editingCaregiver.patients,
        }),
      });
      await loadData();
      toast.success("Cuidador atualizado com sucesso!");
      setIsEditCaregiverOpen(false);
      setEditingCaregiver(null);
    } catch (e: any) {
      console.error("Erro ao atualizar cuidador:", e);
      toast.error(e?.message || "Erro ao atualizar cuidador");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cuidadores</h1>
          <p className="text-gray-500 mt-1">Gerencie os cuidadores e suas escalas de trabalho</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddCaregiverOpen} onOpenChange={setIsAddCaregiverOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#16808c] text-[#16808c] hover:bg-[#16808c]/10">
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Cuidador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#16808c] flex items-center gap-2">
                  <UserPlus className="h-6 w-6" />
                  Novo Cuidador
                </DialogTitle>
                <DialogDescription className="text-base">
                  Adicione um cuidador e associe-o aos pacientes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cg-name">Nome Completo *</Label>
                  <Input
                    id="cg-name"
                    value={newCaregiver.name}
                    onChange={(e) => setNewCaregiver({ ...newCaregiver, name: e.target.value })}
                    placeholder="Nome do cuidador"
                  />
                </div>
                <div>
                  <Label htmlFor="cg-email">E-mail (opcional)</Label>
                  <Input
                    id="cg-email"
                    type="email"
                    value={newCaregiver.email}
                    onChange={(e) => setNewCaregiver({ ...newCaregiver, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="cg-phone">WhatsApp *</Label>
                  <Input
                    id="cg-phone"
                    type="tel"
                    value={newCaregiver.phone}
                    onChange={(e) => setNewCaregiver({ ...newCaregiver, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                <div>
                  <Label>Pacientes Atribuídos</Label>
                  {patients.length === 0 ? (
                    <p className="text-sm text-gray-500 mt-2">Nenhum paciente cadastrado</p>
                  ) : (
                    <>
                      <div className="relative mt-2 mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar pacientes..."
                          value={patientSearchTerm}
                          onChange={(e) => setPatientSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      {newCaregiver.patients.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b">
                          {newCaregiver.patients.map(patientId => {
                            const patient = patients.find(p => p.id === patientId);
                            if (!patient) return null;
                            return (
                              <Badge key={patientId} variant="secondary" className="flex items-center gap-1">
                                {patient.name}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewCaregiver({
                                      ...newCaregiver,
                                      patients: newCaregiver.patients.filter(id => id !== patientId)
                                    });
                                  }}
                                  className="ml-1 hover:text-red-500"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      
                      <div className="border rounded-md max-h-60 overflow-y-auto">
                        <div className="p-2 space-y-1">
                          {patients
                            .filter(patient => 
                              patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase())
                            )
                            .map(patient => {
                              const isSelected = newCaregiver.patients.includes(patient.id);
                              return (
                                <div
                                  key={patient.id}
                                  className={`flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors ${
                                    isSelected ? 'bg-[#16808c]/10 border border-[#16808c]' : ''
                                  }`}
                                  onClick={() => {
                                    if (isSelected) {
                                      setNewCaregiver({
                                        ...newCaregiver,
                                        patients: newCaregiver.patients.filter(id => id !== patient.id)
                                      });
                                    } else {
                                      setNewCaregiver({
                                        ...newCaregiver,
                                        patients: [...newCaregiver.patients, patient.id]
                                      });
                                    }
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="rounded border-gray-300 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <label className="text-sm font-medium cursor-pointer block">
                                      {patient.name}
                                    </label>
                                    <span className="text-xs text-gray-500">
                                      {patient.age} anos • {patient.careType}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          {patients.filter(patient => 
                            patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase())
                          ).length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">
                              Nenhum paciente encontrado
                            </p>
                          )}
                        </div>
                      </div>
                      {newCaregiver.patients.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          {newCaregiver.patients.length} paciente{newCaregiver.patients.length > 1 ? 's' : ''} selecionado{newCaregiver.patients.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddCaregiverOpen(false);
                  setNewCaregiver({ name: "", email: "", phone: "", patients: [] });
                  setPatientSearchTerm("");
                }}>
                  Cancelar
                </Button>
                <Button className="bg-[#16808c] hover:bg-[#16808c]/90" onClick={handleAddCaregiver}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog de Edição de Cuidador */}
          <Dialog open={isEditCaregiverOpen} onOpenChange={setIsEditCaregiverOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#16808c] flex items-center gap-2">
                  <Edit className="h-6 w-6" />
                  Editar Cuidador
                </DialogTitle>
                <DialogDescription className="text-base">
                  Atualize as informações do cuidador
                </DialogDescription>
              </DialogHeader>
              {editingCaregiver && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-cg-name">Nome Completo *</Label>
                    <Input
                      id="edit-cg-name"
                      value={editingCaregiver.name}
                      onChange={(e) => setEditingCaregiver({ ...editingCaregiver, name: e.target.value })}
                      placeholder="Nome do cuidador"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-cg-email">E-mail (opcional)</Label>
                    <Input
                      id="edit-cg-email"
                      type="email"
                      value={editingCaregiver.email || ""}
                      onChange={(e) => setEditingCaregiver({ ...editingCaregiver, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-cg-phone">WhatsApp *</Label>
                    <Input
                      id="edit-cg-phone"
                      type="tel"
                      value={editingCaregiver.phone}
                      onChange={(e) => setEditingCaregiver({ ...editingCaregiver, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                  <div>
                    <Label>Pacientes Atribuídos</Label>
                    {patients.length === 0 ? (
                      <p className="text-sm text-gray-500 mt-2">Nenhum paciente cadastrado</p>
                    ) : (
                      <>
                        <div className="relative mt-2 mb-3">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar pacientes..."
                            value={patientSearchTerm}
                            onChange={(e) => setPatientSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        
                        {editingCaregiver.patients && editingCaregiver.patients.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b">
                            {editingCaregiver.patients.map(patientId => {
                              const patient = patients.find(p => p.id === patientId);
                              if (!patient) return null;
                              return (
                                <Badge key={patientId} variant="secondary" className="flex items-center gap-1">
                                  {patient.name}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCaregiver({
                                        ...editingCaregiver,
                                        patients: editingCaregiver.patients.filter(id => id !== patientId)
                                      });
                                    }}
                                    className="ml-1 hover:text-red-500"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                        
                        <div className="border rounded-md max-h-60 overflow-y-auto">
                          <div className="p-2 space-y-1">
                            {patients
                              .filter(patient => 
                                patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase())
                              )
                              .map(patient => {
                                const isSelected = editingCaregiver.patients?.includes(patient.id) || false;
                                return (
                                  <div
                                    key={patient.id}
                                    className={`flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors ${
                                      isSelected ? 'bg-[#16808c]/10 border border-[#16808c]' : ''
                                    }`}
                                    onClick={() => {
                                      const currentPatients = editingCaregiver.patients || [];
                                      if (isSelected) {
                                        setEditingCaregiver({
                                          ...editingCaregiver,
                                          patients: currentPatients.filter(id => id !== patient.id)
                                        });
                                      } else {
                                        setEditingCaregiver({
                                          ...editingCaregiver,
                                          patients: [...currentPatients, patient.id]
                                        });
                                      }
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {}}
                                      className="rounded border-gray-300 cursor-pointer"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <label className="text-sm font-medium cursor-pointer block">
                                        {patient.name}
                                      </label>
                                      <span className="text-xs text-gray-500">
                                        {patient.age} anos • {patient.careType}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            {patients.filter(patient => 
                              patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase())
                            ).length === 0 && (
                              <p className="text-sm text-gray-500 text-center py-4">
                                Nenhum paciente encontrado
                              </p>
                            )}
                          </div>
                        </div>
                        {editingCaregiver.patients && editingCaregiver.patients.length > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            {editingCaregiver.patients.length} paciente{editingCaregiver.patients.length > 1 ? 's' : ''} selecionado{editingCaregiver.patients.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsEditCaregiverOpen(false);
                  setEditingCaregiver(null);
                  setPatientSearchTerm("");
                }}>
                  Cancelar
                </Button>
                <Button className="bg-[#16808c] hover:bg-[#16808c]/90" onClick={handleSaveEditCaregiver}>
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#16808c] hover:bg-[#0f6069]">
                <Plus className="h-4 w-4 mr-2" />
                Nova Escala
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#16808c] flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Nova Escala de Cuidador
              </DialogTitle>
              <DialogDescription className="text-base">
                Defina o cuidador, selecione um ou mais pacientes e adicione um ou mais períodos de trabalho.
                Você pode criar períodos que atravessam meia-noite (ex: 19:00 às 08:00).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="caregiver">Cuidador *</Label>
                <Select
                  value={newSchedule.caregiverId}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, caregiverId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cuidador" />
                  </SelectTrigger>
                  <SelectContent>
                    {caregivers.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500 text-center">
                        Nenhum cuidador cadastrado. Adicione um cuidador primeiro.
                      </div>
                    ) : (
                      caregivers.map((cg) => (
                        <SelectItem key={String(cg.id)} value={String(cg.id)}>
                          {cg.name} {cg.phone ? `(${cg.phone})` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="patients">Pacientes *</Label>
                <div className="mt-2 border rounded-lg p-3 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {patients.map((patient) => {
                      const isSelected = newSchedule.patientIds.includes(patient.id);
                      return (
                        <div
                          key={patient.id}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => {
                            if (isSelected) {
                              setNewSchedule({
                                ...newSchedule,
                                patientIds: newSchedule.patientIds.filter(id => id !== patient.id)
                              });
                            } else {
                              setNewSchedule({
                                ...newSchedule,
                                patientIds: [...newSchedule.patientIds, patient.id]
                              });
                            }
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-gray-300 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <label className="text-sm font-medium cursor-pointer block">
                              {patient.name}
                            </label>
                            <span className="text-xs text-gray-500">
                              {patient.age} anos • {patient.careType}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {newSchedule.patientIds.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {newSchedule.patientIds.length} paciente{newSchedule.patientIds.length > 1 ? 's' : ''} selecionado{newSchedule.patientIds.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Lista de Períodos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Períodos de Escala *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPeriod}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Período
                  </Button>
                </div>

                {newSchedule.periods.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nenhum período adicionado</p>
                    <p className="text-xs text-gray-400 mt-1">Clique em "Adicionar Período" para começar</p>
                  </div>
                )}

                {newSchedule.periods.map((period, index) => (
                  <Card key={period.id} className="p-4 border-2">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#16808c] text-white flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <span className="font-semibold text-gray-700">Período {index + 1}</span>
                      </div>
                      {newSchedule.periods.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removePeriod(period.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Dias da Semana */}
                      <div>
                        <Label className="text-sm font-medium">Dias da Semana *</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {daysOfWeekOptions.map((day) => (
                            <div key={day.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`period-${period.id}-day-${day.value}`}
                                checked={period.daysOfWeek.includes(day.value)}
                                onCheckedChange={(checked) => handleDayToggle(period.id, day.value, checked as boolean)}
                              />
                              <Label
                                htmlFor={`period-${period.id}-day-${day.value}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {day.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Horários */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`period-${period.id}-startTime`}>Horário de Início *</Label>
                          <Input
                            id={`period-${period.id}-startTime`}
                            type="time"
                            value={period.startTime}
                            onChange={(e) => {
                              const crossesMidnight = checkMidnightCross(e.target.value, period.endTime);
                              updatePeriod(period.id, { startTime: e.target.value, crossesMidnight });
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`period-${period.id}-endTime`}>Horário de Fim *</Label>
                          <Input
                            id={`period-${period.id}-endTime`}
                            type="time"
                            value={period.endTime}
                            onChange={(e) => {
                              const crossesMidnight = checkMidnightCross(period.startTime, e.target.value);
                              updatePeriod(period.id, { endTime: e.target.value, crossesMidnight });
                            }}
                            className="mt-1"
                          />
                          {period.crossesMidnight && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Período atravessa meia-noite (termina no dia seguinte)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => {
                setIsAddScheduleOpen(false);
                setNewSchedule({
                  caregiverId: "",
                  patientIds: [],
                  periods: []
                });
              }}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAddSchedule} 
                className="bg-[#16808c] hover:bg-[#0f6069]"
                disabled={newSchedule.periods.length === 0}
              >
                Criar {newSchedule.periods.length > 1 ? `${newSchedule.periods.length} Escalas` : "Escala"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Lista de Cuidadores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#16808c] flex items-center gap-2">
            <Users className="h-5 w-5" />
            Cuidadores Cadastrados
          </CardTitle>
          <CardDescription>
            Gerencie os cuidadores responsáveis pelos pacientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {caregivers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum cuidador cadastrado</p>
              <p className="text-sm text-gray-400 mt-1">Adicione um cuidador para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caregivers.map((caregiver) => (
                <Card key={caregiver.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-[#6cced9] text-white flex items-center justify-center font-semibold">
                          {caregiver.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg text-[#16808c] truncate">{caregiver.name}</CardTitle>
                          {caregiver.email && (
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{caregiver.email}</span>
                            </CardDescription>
                          )}
                          {caregiver.phone && (
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3" />
                              <span>{caregiver.phone}</span>
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#16808c] hover:text-[#16808c] hover:bg-[#16808c]/10"
                          onClick={() => handleEditCaregiverClick(caregiver)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#a61f43] hover:text-[#a61f43] hover:bg-[#a61f43]/10"
                          onClick={() => {
                            setCaregiverToDelete(caregiver.id);
                            setIsDeleteCaregiverOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {caregiver.patients && caregiver.patients.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 font-medium">Pacientes atribuídos:</p>
                        <div className="flex flex-wrap gap-1">
                          {caregiver.patients.map(patientId => {
                            const patient = patients.find(p => p.id === patientId);
                            if (!patient) return null;
                            return (
                              <Badge key={patientId} variant="secondary" className="text-xs">
                                {patient.name}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Nenhum paciente atribuído</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Caregiver Dialog */}
      <AlertDialog open={isDeleteCaregiverOpen} onOpenChange={setIsDeleteCaregiverOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cuidador? Esta ação não pode ser desfeita e todas as escalas associadas serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteCaregiverOpen(false);
              setCaregiverToDelete(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCaregiver}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Calendário Semanal - Matriz de Horários (estilo Teams) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#16808c] flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendário Semanal de Escalas
          </CardTitle>
          <CardDescription>
            Visualize as escalas organizadas por dia da semana e horário
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">Nenhuma escala cadastrada</p>
              <p className="text-gray-400 text-sm mt-2">Comece criando uma nova escala</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Cabeçalho com dias da semana */}
                <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] gap-1 mb-1">
                  <div className="font-semibold text-gray-700 p-2 text-sm border-b-2 border-gray-300 bg-gray-50">
                    Hora
                  </div>
                  {daysOfWeekOptions.map((day) => (
                    <div
                      key={day.value}
                      className="font-semibold text-gray-700 p-2 text-center text-sm border-b-2 border-gray-300 bg-gray-50"
                    >
                      {day.label.split("-")[0]}
                    </div>
                  ))}
                </div>
                
                {/* Estrutura estilo Teams: cada dia tem sua coluna com todas as horas */}
                <div className="relative">
                  {/* Grid principal: 1 coluna de horas + 7 colunas de dias */}
                  <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] gap-1">
                    {/* Coluna de horas */}
                    <div className="flex flex-col">
                      <div className="h-10"></div> {/* Espaço para o cabeçalho */}
                    {Array.from({ length: 24 }, (_, hour) => {
                      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
                      const show = hour === 0 || hour === 8 || hour === 12 || hour === 15 || hour === 19 || hour === 23;
                      return (
                        <div
                          key={hour}
                          className="font-medium text-gray-600 p-2 text-xs bg-gray-50 border-r border-gray-200 border-b border-gray-200 min-h-[60px] flex items-center"
                        >
                          {show ? hourStr : ''}
                        </div>
                      );
                    })}
                    </div>
                    
                    {/* Colunas dos dias da semana */}
                    {daysOfWeekOptions.map((day) => {
                      const dayIndexInWeek = daysOfWeekOptions.findIndex(d => d.value === day.value);
                      return (
                        <div key={day.value} className="flex flex-col">
                          <div className="h-10"></div> {/* Espaço para o cabeçalho */}
                          {/* Container para as células de hora e blocos de escalas */}
                          <div className="relative">
                            {Array.from({ length: 24 }, (_, hour) => (
                              <div
                                key={hour}
                                className="min-h-[60px] border border-gray-200 bg-white relative"
                                data-day={day.value}
                                data-hour={hour}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Renderizar blocos de escalas (posicionados absolutamente sobre o grid) */}
                  {schedules.map((schedule) => {
                    return schedule.daysOfWeek.map((dayName) => {
                      const dayIndexInWeek = daysOfWeekOptions.findIndex(d => d.value === dayName);
                      if (dayIndexInWeek === -1) return null;
                      
                      const [startH, startM] = schedule.startTime.split(":").map(Number);
                      const [endH, endM] = schedule.endTime.split(":").map(Number);
                      const startMinutes = startH * 60 + startM;
                      const endMinutes = endH * 60 + endM;
                      const crossesMidnight = endMinutes <= startMinutes;
                      
                      // Altura de cada célula (60px) e espaço do cabeçalho (40px = h-10)
                      const cellHeight = 60;
                      const headerHeight = 40;
                      
                      // Calcular posição left baseada na coluna do dia
                      // Coluna 0 = horas, colunas 1-7 = dias da semana
                      const leftOffset = (dayIndexInWeek + 1) * (100 / 8);
                      const columnWidth = 100 / 8;
                      
                      if (crossesMidnight) {
                        // Período que atravessa meia-noite
                        // Calcular minutos até meia-noite
                        const minutesUntilMidnight = (24 * 60) - startMinutes;
                        const firstPartHeight = (minutesUntilMidnight / 60) * cellHeight;
                        // Topo começa após o cabeçalho + posição da hora inicial
                        const topOffset = headerHeight + (startH * cellHeight);
                        
                        // Verificar se o próximo dia está na escala
                        const nextDayIndex = (dayIndexInWeek + 1) % 7;
                        const nextDayName = daysOfWeekOptions[nextDayIndex].value;
                        const hasNextDay = schedule.daysOfWeek.includes(nextDayName);
                        
                        // Calcular altura da segunda parte (do início do dia até o fim)
                        const secondPartHeight = (endMinutes / 60) * cellHeight;
                        const nextDayLeftOffset = (nextDayIndex + 1) * (100 / 8);
                        
                        return (
                          <div key={`${schedule.id}-${dayName}-container`}>
                            {/* Bloco na primeira parte (mesmo dia) - 19:00 até 23:59 */}
                            <div
                              key={`${schedule.id}-${dayName}-first`}
                              className="absolute bg-[#16808c] text-white rounded p-1 cursor-pointer hover:bg-[#0f6069] transition-colors z-20 border border-[#0f6069] shadow-sm"
                              style={{
                                left: `calc(${leftOffset}% + 4px)`,
                                width: `calc(${columnWidth}% - 8px)`,
                                top: `${topOffset}px`,
                                height: `${firstPartHeight}px`,
                              }}
                              onClick={() => handleEditClick(schedule)}
                              title={`${schedule.caregiverName} - ${schedule.startTime} às ${schedule.endTime}`}
                            >
                              <div className="text-[10px] font-semibold truncate">{schedule.caregiverName}</div>
                              <div className="text-[9px] opacity-90 truncate">
                                {schedule.patients.length === 1 
                                  ? schedule.patients[0].patientName
                                  : `${schedule.patients.length} pacientes`}
                              </div>
                              <div className="text-[8px] opacity-75 mt-1">
                                {schedule.startTime} - 23:59
                              </div>
                            </div>
                            
                            {/* Bloco na segunda parte (próximo dia) - 00:00 até 08:00 */}
                            {hasNextDay && (
                              <div
                                key={`${schedule.id}-${nextDayName}-second`}
                                className="absolute bg-[#16808c] text-white rounded p-1 cursor-pointer hover:bg-[#0f6069] transition-colors z-20 border border-[#0f6069] shadow-sm"
                                style={{
                                  left: `calc(${nextDayLeftOffset}% + 4px)`,
                                  width: `calc(${columnWidth}% - 8px)`,
                                  top: `${headerHeight}px`, // Após o cabeçalho
                                  height: `${secondPartHeight}px`,
                                }}
                                onClick={() => handleEditClick(schedule)}
                                title={`${schedule.caregiverName} - ${schedule.startTime} às ${schedule.endTime}`}
                              >
                                <div className="text-[10px] font-semibold truncate">{schedule.caregiverName}</div>
                                <div className="text-[9px] opacity-90 truncate">
                                  {schedule.patients.length === 1 
                                    ? schedule.patients[0].patientName
                                    : `${schedule.patients.length} pacientes`}
                                </div>
                                <div className="text-[8px] opacity-75 mt-1">
                                  00:00 - {schedule.endTime}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        // Período normal (não atravessa meia-noite)
                        // Calcular a duração em minutos para precisão
                        // Para 08:00 às 12:00, deve ocupar as horas 8, 9, 10, 11 (4 horas completas)
                        const durationMinutes = endMinutes - startMinutes;
                        const durationHours = durationMinutes / 60;
                        
                        // A altura do bloco deve ser baseada na duração completa
                        // Se começa às 08:00 e termina às 12:00, o bloco deve ocupar 4 células (8, 9, 10, 11)
                        const heightInPixels = durationHours * cellHeight;
                        
                        // O topo deve começar após o cabeçalho + posição da hora inicial
                        // Se começa às 08:00, o topo deve estar na posição após o cabeçalho + (8 * 60px)
                        const topOffset = headerHeight + (startH * cellHeight);
                        
                        return (
                          <div
                            key={`${schedule.id}-${dayName}`}
                            className="absolute bg-[#16808c] text-white rounded p-1 cursor-pointer hover:bg-[#0f6069] transition-colors z-20 border border-[#0f6069] shadow-sm"
                            style={{
                              left: `calc(${leftOffset}% + 4px)`,
                              width: `calc(${columnWidth}% - 8px)`,
                              top: `${topOffset}px`,
                              height: `${heightInPixels}px`,
                            }}
                            onClick={() => handleEditClick(schedule)}
                            title={`${schedule.caregiverName} - ${schedule.startTime} às ${schedule.endTime}`}
                          >
                            <div className="text-[10px] font-semibold truncate">{schedule.caregiverName}</div>
                            <div className="text-[9px] opacity-90 truncate">
                              {schedule.patients.length === 1 
                                ? schedule.patients[0].patientName
                                : `${schedule.patients.length} pacientes`}
                            </div>
                            <div className="text-[8px] opacity-75 mt-1">
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                          </div>
                        );
                      }
                    });
                  }).flat().filter(Boolean)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditScheduleOpen} onOpenChange={setIsEditScheduleOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Escala de Cuidador</DialogTitle>
            <DialogDescription>
              Atualize as informações da escala
            </DialogDescription>
          </DialogHeader>
          {editingSchedule && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-caregiver">Cuidador *</Label>
                <Select
                  value={editingSchedule.caregiverId}
                  onValueChange={(value) => setEditingSchedule({ ...editingSchedule, caregiverId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cuidador" />
                  </SelectTrigger>
                  <SelectContent>
                    {caregivers.map((cg) => (
                      <SelectItem key={String(cg.id)} value={String(cg.id)}>
                        {cg.name} {cg.phone ? `(${cg.phone})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-patients">Pacientes *</Label>
                <div className="mt-2 border rounded-lg p-3 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {patients.map((patient) => {
                      const isSelected = editingSchedule.patientIds?.includes(patient.id) || false;
                      return (
                        <div
                          key={patient.id}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => {
                            const currentIds = editingSchedule.patientIds || [];
                            if (isSelected) {
                              setEditingSchedule({
                                ...editingSchedule,
                                patientIds: currentIds.filter(id => id !== patient.id)
                              });
                            } else {
                              setEditingSchedule({
                                ...editingSchedule,
                                patientIds: [...currentIds, patient.id]
                              });
                            }
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-gray-300 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <label className="text-sm font-medium cursor-pointer block">
                              {patient.name}
                            </label>
                            <span className="text-xs text-gray-500">
                              {patient.age} anos • {patient.careType}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {editingSchedule.patientIds && editingSchedule.patientIds.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {editingSchedule.patientIds.length} paciente{editingSchedule.patientIds.length > 1 ? 's' : ''} selecionado{editingSchedule.patientIds.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div>
                <Label>Dias da Semana *</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {daysOfWeekOptions.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-day-${day.value}`}
                        checked={editingSchedule.daysOfWeek.includes(day.value)}
                        onCheckedChange={(checked) => handleEditDayToggle(day.value, checked as boolean)}
                      />
                      <Label
                        htmlFor={`edit-day-${day.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-startTime">Horário de Início *</Label>
                  <Input
                    id="edit-startTime"
                    type="time"
                    value={editingSchedule.startTime}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-endTime">Horário de Fim *</Label>
                  <Input
                    id="edit-endTime"
                    type="time"
                    value={editingSchedule.endTime}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditScheduleOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="bg-[#16808c] hover:bg-[#0f6069]">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta escala? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

