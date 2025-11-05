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
  Users
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

  const [newSchedule, setNewSchedule] = useState({
    caregiverId: "",
    patientId: "",
    daysOfWeek: [] as string[],
    startTime: "",
    endTime: ""
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
      setCaregivers(cgs || [});
      setSchedules(schs || [});
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar escalas de cuidadores");
    }
  };

  const handleDayToggle = (day: string, isChecked: boolean) => {
    if (isChecked) {
      setNewSchedule({
        ...newSchedule,
        daysOfWeek: [...newSchedule.daysOfWeek, day]
      });
    } else {
      setNewSchedule({
        ...newSchedule,
        daysOfWeek: newSchedule.daysOfWeek.filter(d => d !== day)
      });
    }
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
    if (!newSchedule.caregiverId || !newSchedule.patientId || 
        newSchedule.daysOfWeek.length === 0 || 
        !newSchedule.startTime || !newSchedule.endTime) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await apiFetch(`/caregiver-schedules`, {
        method: "POST",
        body: JSON.stringify(newSchedule)
      });
      toast.success("Escala criada com sucesso!");
      setIsAddScheduleOpen(false);
      setNewSchedule({
        caregiverId: "",
        patientId: "",
        daysOfWeek: [],
        startTime: "",
        endTime: ""
      });
      await loadData();
    } catch (error: any) {
      console.error("Erro ao criar escala:", error);
      toast.error(error?.message || "Erro ao criar escala");
    }
  };

  const handleEditClick = (schedule: CaregiverSchedule) => {
    setEditingSchedule(schedule);
    setIsEditScheduleOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSchedule) return;
    
    if (!editingSchedule.caregiverId || !editingSchedule.patientId || 
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
          patientId: editingSchedule.patientId,
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

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || "Paciente não encontrado";
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Escalas de Cuidadores</h1>
          <p className="text-gray-500 mt-1">Gerencie os horários e responsabilidades dos cuidadores</p>
        </div>
        <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#16808c] hover:bg-[#0f6069]">
              <Plus className="h-4 w-4 mr-2" />
              Nova Escala
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Escala de Cuidador</DialogTitle>
              <DialogDescription>
                Defina o cuidador responsável, paciente, dias da semana e horário de trabalho
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
                    {caregivers.map((cg) => (
                      <SelectItem key={cg.id} value={cg.id}>
                        {cg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="patient">Paciente *</Label>
                <Select
                  value={newSchedule.patientId}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, patientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Dias da Semana *</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {daysOfWeekOptions.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={newSchedule.daysOfWeek.includes(day.value)}
                        onCheckedChange={(checked) => handleDayToggle(day.value, checked as boolean)}
                      />
                      <Label
                        htmlFor={`day-${day.value}`}
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
                  <Label htmlFor="startTime">Horário de Início *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">Horário de Fim *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddScheduleOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddSchedule} className="bg-[#16808c] hover:bg-[#0f6069]">
                Criar Escala
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">Nenhuma escala cadastrada</p>
            <p className="text-gray-400 text-sm mt-2">Comece criando uma nova escala</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-[#16808c]" />
                      {schedule.caregiverName}
                    </CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {schedule.patientName}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(schedule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{formatDays(schedule.daysOfWeek)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {schedule.startTime} - {schedule.endTime}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
                      <SelectItem key={cg.id} value={cg.id}>
                        {cg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-patient">Paciente *</Label>
                <Select
                  value={editingSchedule.patientId}
                  onValueChange={(value) => setEditingSchedule({ ...editingSchedule, patientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

