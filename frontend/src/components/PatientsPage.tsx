import React, { useState, useMemo, useEffect } from "react";
import type { Patient, Medication } from "./DataContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Plus,
  Search,
  User,
  Pill,
  AlertTriangle,
  Calendar,
  MapPin,
  ChevronRight,
  UserPlus,
  Share2,
  Edit,
  Trash2,
  Clock,
  Package,
  X,
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
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";
import { useData } from "./DataContext";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../lib/api";
import type { CheckedState } from "@radix-ui/react-checkbox";

type PatientsPageProps = {
  onNavigate: (page: string, id?: string) => void;
};

type RawMedication = Medication & {
  Id?: string;
  Name?: string;
  Dosage?: number;
  DosageUnit?: string;
  PresentationForm?: string;
  Patients?: Array<{ PatientId?: string; patientId?: string }>;
  patients?: Array<{ PatientId?: string; patientId?: string }>;
};

export function PatientsPage({ onNavigate }: PatientsPageProps) {
  const {
    patients,
    medications,
    addPatient,
    updatePatient,
    deletePatient,
    sharePatientWith,
  } = useData();
  const [allMedications, setAllMedications] = useState<RawMedication[]>([]);
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [medicationsDialogOpen, setMedicationsDialogOpen] = useState(false);
  const [selectedPatientForMedications, setSelectedPatientForMedications] =
    useState<Patient | null>(null);
  const [addMedicationDialogOpen, setAddMedicationDialogOpen] = useState(false);
  const [selectedPatientForAddMedication, setSelectedPatientForAddMedication] =
    useState<Patient | null>(null);
  const [newMedicationPosology, setNewMedicationPosology] = useState({
    medicationId: "",
    frequency: "",
    times: [] as string[],
    isHalfDose: false,
    customFrequency: "",
    isExtra: false,
    treatmentType: "continuo" as "continuo" | "temporario",
    treatmentStartDate: new Date().toISOString().split("T")[0],
    treatmentEndDate: "",
    hasTapering: false,
    dailyConsumption: "",
    prescriptionId: "",
  });
  const [newPatient, setNewPatient] = useState({
    name: "",
    birthDate: "",
    careType: "",
    observations: "",
  });
  const [editingPatient, setEditingPatient] = useState({
    id: "",
    name: "",
    birthDate: "",
    careType: "",
    observations: "",
  });

  // Carregar todas as medicações quando o diálogo for aberto
  useEffect(() => {
    if (addMedicationDialogOpen) {
      apiFetch(`/medications/all`)
        .then((data) =>
          setAllMedications(
            Array.isArray(data) ? (data as RawMedication[]) : []
          )
        )
        .catch((error) => {
          console.error("Erro ao carregar medicações:", error);
          setAllMedications([]);
        });
    }
  }, [addMedicationDialogOpen]);

  // Memoized filtered patients
  const filteredPatients = useMemo<Patient[]>(() => {
    return patients.filter((patient: Patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  // Memoized stats
  const stats = useMemo(() => {
    const totalPatients = patients.length;

    // Contar apenas medicações ativas (não finalizadas)
    const totalMedications = medications.filter((med: Medication) => {
      // Se for tratamento contínuo, está ativo
      if (med.treatmentType === "continuo") {
        return true;
      }
      // Se for tratamento temporário, verificar se ainda não passou da data de término
      if (med.treatmentType === "temporario" && med.treatmentEndDate) {
        const endDate = new Date(med.treatmentEndDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return endDate >= today;
      }
      // Se não tem data de término definida, considerar ativo
      return true;
    }).length;

    // Contar alertas pendentes (medicações com status critical ou warning)
    const totalAlerts = medications.filter(
      (med: Medication) => med.status === "critical" || med.status === "warning"
    ).length;

    return { totalPatients, totalMedications, totalAlerts };
  }, [patients, medications]);

  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.birthDate) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const birthDate = new Date(newPatient.birthDate);
    const age = Math.floor(
      (Date.now() - birthDate.getTime()) / (365.25 * 86400000)
    );

    addPatient({
      name: newPatient.name,
      age,
      birthDate: newPatient.birthDate,
      careType: newPatient.careType === "home" ? "Domiciliar" : "Institucional",
      medications: 0,
      caregivers: 0,
      lastUpdate: "Há poucos segundos",
      criticalAlerts: 0,
      observations: newPatient.observations,
    });

    toast.success("Paciente adicionado com sucesso!");
    setIsAddDialogOpen(false);
    setNewPatient({ name: "", birthDate: "", careType: "", observations: "" });
  };

  const handleSharePatient = async () => {
    if (!shareEmail) {
      toast.error("Digite o email do representante");
      return;
    }

    const success = await sharePatientWith(selectedPatientId, shareEmail);

    if (success) {
      toast.success("Paciente compartilhado com sucesso!");
      setIsShareDialogOpen(false);
      setShareEmail("");
    } else {
      toast.error("Erro ao compartilhar. Verifique o email e tente novamente.");
    }
  };

  const openShareDialog = (
    patientId: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setSelectedPatientId(patientId);
    setIsShareDialogOpen(true);
  };

  const canSharePatient = (patient: Patient) => {
    return currentUser && patient.ownerId === currentUser.id;
  };

  const openEditDialog = (
    patient: Patient,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setEditingPatient({
      id: patient.id,
      name: patient.name,
      birthDate: patient.birthDate,
      careType: patient.careType === "Domiciliar" ? "home" : "institution",
      observations: patient.observations,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditPatient = () => {
    if (!editingPatient.name || !editingPatient.birthDate) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const birthDate = new Date(editingPatient.birthDate);
    const age = Math.floor(
      (Date.now() - birthDate.getTime()) / (365.25 * 86400000)
    );

    updatePatient(editingPatient.id, {
      name: editingPatient.name,
      age,
      birthDate: editingPatient.birthDate,
      careType:
        editingPatient.careType === "home" ? "Domiciliar" : "Institucional",
      observations: editingPatient.observations,
      lastUpdate: "Há poucos segundos",
    });

    toast.success("Paciente atualizado com sucesso!");
    setIsEditDialogOpen(false);
  };

  const openDeleteDialog = (
    patientId: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setSelectedPatientId(patientId);
    setDeleteDialogOpen(true);
  };

  const handleDeletePatient = () => {
    deletePatient(selectedPatientId);
    toast.success("Paciente excluído com sucesso");
    setDeleteDialogOpen(false);
  };

  const handlePatientCardClick = (patient: Patient) => {
    setSelectedPatientForMedications(patient);
    setMedicationsDialogOpen(true);
  };

  // Organizar medicações por horário específico
  const getMedicationsByTime = useMemo((): Map<string, Medication[]> => {
    if (!selectedPatientForMedications) return new Map<string, Medication[]>();

    // Filtrar medicações do paciente selecionado
    // Comparar IDs como strings para garantir compatibilidade
    const patientMedications = medications.filter(
      (m: Medication) =>
        String(m.patientId) === String(selectedPatientForMedications.id)
    );

    // Debug: verificar se encontrou medicações
    if (patientMedications.length === 0 && medications.length > 0) {
      console.log("Nenhuma medicação encontrada para o paciente:", {
        patientId: selectedPatientForMedications.id,
        patientName: selectedPatientForMedications.name,
        totalMedications: medications.length,
        medicationPatientIds: medications.map((m: Medication) => m.patientId),
        medicationPatients: medications.map((m: Medication) => ({
          id: m.id,
          name: m.name,
          patientId: m.patientId,
          patient: m.patient,
        })),
      });
    }

    const medicationsByTime = new Map<string, Medication[]>();

    patientMedications.forEach((med: Medication) => {
      // Verificar se med.times existe e não está vazio
      if (!med.times || !Array.isArray(med.times) || med.times.length === 0) {
        console.log("Medicação sem horários:", {
          id: med.id,
          name: med.name,
          patientId: med.patientId,
          patient: med.patient,
        });
        return; // Pular medicações sem horários
      }

      med.times.forEach((time: string) => {
        // Normalizar horário - extrair hora ou usar o texto como está
        let normalizedTime = time.trim();

        // Tentar extrair hora no formato HH:MM
        const timeMatch = time.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          normalizedTime = `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
        } else {
          // Mapear texto para horário aproximado
          const timeLower = time.toLowerCase();
          if (timeLower.includes("manhã") || timeLower.includes("manha"))
            normalizedTime = "08:00";
          else if (timeLower.includes("tarde")) normalizedTime = "14:00";
          else if (timeLower.includes("noite")) normalizedTime = "20:00";
          else normalizedTime = time; // Usar como está se não conseguir mapear
        }

        if (!medicationsByTime.has(normalizedTime)) {
          medicationsByTime.set(normalizedTime, []);
        }
        medicationsByTime.get(normalizedTime)!.push(med);
      });
    });

    // Ordenar por horário
    const sorted = Array.from(medicationsByTime.entries()).sort(
      ([timeA], [timeB]) => {
        const partsA = timeA.split(":").map(Number);
        const partsB = timeB.split(":").map(Number);
        if (partsA[0] !== partsB[0]) return partsA[0] - partsB[0];
        return partsA[1] - partsB[1];
      }
    );

    return new Map(sorted);
  }, [selectedPatientForMedications, medications]);

  const getUnitLabel = (unit: string) => {
    const labels: Record<string, string> = {
      mg: "mg",
      g: "g",
      ml: "ml",
      mcg: "mcg",
      ui: "UI",
      comprimido: "comp",
      capsula: "caps",
      gotas: "gotas",
      aplicacao: "aplicação",
      inalacao: "inalação",
      ampola: "ampola",
      xarope: "xarope",
      suspensao: "suspensão",
    };
    return labels[unit] || unit;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#16808c]">Pacientes</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os pacientes sob sua responsabilidade
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#16808c] hover:bg-[#16808c]/90 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-[#16808c]">
                Novo Paciente
              </DialogTitle>
              <DialogDescription>
                Adicione um novo paciente para gerenciar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={newPatient.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewPatient({ ...newPatient, name: e.target.value })
                  }
                  placeholder="Nome do paciente"
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={newPatient.birthDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewPatient({ ...newPatient, birthDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="careType">Tipo de Cuidado</Label>
                <Select
                  value={newPatient.careType}
                  onValueChange={(value: string) =>
                    setNewPatient({ ...newPatient, careType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Domiciliar</SelectItem>
                    <SelectItem value="institution">Institucional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="observations">Observações Médicas</Label>
                <Textarea
                  id="observations"
                  value={newPatient.observations}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewPatient({
                      ...newPatient,
                      observations: e.target.value,
                    })
                  }
                  placeholder="Condições de saúde, alergias, etc."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#16808c] hover:bg-[#16808c]/90 w-full sm:w-auto"
                onClick={handleAddPatient}
              >
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar pacientes..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0 rounded-full bg-[#6cced9]/20 flex items-center justify-center">
                <User className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-[#16808c]" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#16808c]">
                  {stats.totalPatients}
                </div>
                <div className="text-sm sm:text-base text-gray-600 truncate mt-1 sm:mt-2">
                  Total de Pacientes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0 rounded-full bg-[#a0bf80]/20 flex items-center justify-center">
                <Pill className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-[#a0bf80]" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#16808c]">
                  {stats.totalMedications}
                </div>
                <div className="text-sm sm:text-base text-gray-600 truncate mt-1 sm:mt-2">
                  Medicamentos Ativos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0 rounded-full bg-[#f2c36b]/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-[#f2c36b]" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#f2c36b]">
                  {stats.totalAlerts}
                </div>
                <div className="text-sm sm:text-base text-gray-600 truncate mt-1 sm:mt-2">
                  Alertas Pendentes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-[#16808c]">
              Editar Paciente
            </DialogTitle>
            <DialogDescription>
              Atualize as informações do paciente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome Completo *</Label>
              <Input
                id="edit-name"
                value={editingPatient.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingPatient({ ...editingPatient, name: e.target.value })
                }
                placeholder="Nome do paciente"
              />
            </div>
            <div>
              <Label htmlFor="edit-birthDate">Data de Nascimento *</Label>
              <Input
                id="edit-birthDate"
                type="date"
                value={editingPatient.birthDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingPatient({
                    ...editingPatient,
                    birthDate: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-careType">Tipo de Cuidado</Label>
              <Select
                value={editingPatient.careType}
                onValueChange={(value: string) =>
                  setEditingPatient({ ...editingPatient, careType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Domiciliar</SelectItem>
                  <SelectItem value="institution">Institucional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-observations">Observações Médicas</Label>
              <Textarea
                id="edit-observations"
                value={editingPatient.observations}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditingPatient({
                    ...editingPatient,
                    observations: e.target.value,
                  })
                }
                placeholder="Condições de saúde, alergias, etc."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#16808c] hover:bg-[#16808c]/90 w-full sm:w-auto"
              onClick={handleEditPatient}
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Patient Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-[#16808c]">
              Compartilhar Paciente
            </DialogTitle>
            <DialogDescription>
              Adicione outro representante legal para ter acesso a este paciente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="shareEmail">Email do Representante</Label>
              <Input
                id="shareEmail"
                type="email"
                value={shareEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setShareEmail(e.target.value)
                }
                placeholder="representante@email.com"
              />
              <p className="text-sm text-gray-500 mt-2">
                O representante poderá visualizar e gerenciar este paciente
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsShareDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#16808c] hover:bg-[#16808c]/90 w-full sm:w-auto"
              onClick={handleSharePatient}
            >
              Compartilhar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O paciente e todos os seus dados
              (medicamentos, estoques, etc.) serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePatient}
              className="bg-[#a61f43] hover:bg-[#a61f43]/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Patients List */}
      <div className="grid gap-4">
        {filteredPatients.map((patient) => (
          <Card
            key={patient.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handlePatientCardClick(patient)}
          >
            <CardContent className="p-4 sm:p-6">
              {/* Mobile Layout */}
              <div className="block sm:hidden space-y-4">
                {/* Header com Avatar e Nome */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-14 w-14 flex-shrink-0">
                    <AvatarFallback className="bg-[#6cced9] text-white">
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#16808c] text-lg truncate">
                          {patient.name}
                        </h3>
                        <p className="text-gray-600">{patient.age} anos</p>
                      </div>
                      <div className="flex gap-1">
                        {canSharePatient(patient) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0 h-8 w-8"
                              onClick={(
                                e: React.MouseEvent<HTMLButtonElement>
                              ) => openEditDialog(patient, e)}
                            >
                              <Edit className="h-4 w-4 text-[#16808c]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0 h-8 w-8"
                              onClick={(
                                e: React.MouseEvent<HTMLButtonElement>
                              ) => openShareDialog(patient.id, e)}
                            >
                              <Share2 className="h-4 w-4 text-[#16808c]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0 h-8 w-8 text-[#a61f43] hover:text-[#a61f43] hover:bg-[#a61f43]/10"
                              onClick={(
                                e: React.MouseEvent<HTMLButtonElement>
                              ) => openDeleteDialog(patient.id, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Alerta removido do paciente: alertas aparecem apenas nas medicações */}
                    {patient.ownerId !== currentUser?.id && (
                      <Badge variant="outline" className="bg-[#6cced9]/10 mt-1">
                        Compartilhado
                      </Badge>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>

                {/* Info Grid Mobile */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{patient.careType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Pill className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{patient.medications} meds</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UserPlus className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {patient.caregivers} cuidador
                      {patient.caregivers !== 1 ? "es" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {patient.createdAt
                        ? new Date(patient.createdAt).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : patient.lastUpdate}
                    </span>
                  </div>
                </div>

                {/* Data de Aniversário - Mobile */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    <span className="font-medium">Aniversário:</span>{" "}
                    {new Date(patient.birthDate).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Observações Mobile */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500 line-clamp-2">
                    <span className="font-medium">Obs:</span>{" "}
                    {patient.observations}
                  </p>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex items-start gap-4">
                <Avatar className="h-16 w-16 flex-shrink-0">
                  <AvatarFallback className="bg-[#6cced9] text-white text-xl">
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-[#16808c] truncate">
                          {patient.name}
                        </h3>
                        {patient.ownerId !== currentUser?.id && (
                          <Badge
                            variant="outline"
                            className="bg-[#6cced9]/10 flex-shrink-0"
                          >
                            Compartilhado
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600">{patient.age} anos</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Alerta removido do paciente: alertas aparecem apenas nas medicações */}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            setSelectedPatientForAddMedication(patient);
                            setAddMedicationDialogOpen(true);
                          }}
                          className="text-[#16808c] hover:bg-[#16808c]/10"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar Medicação
                        </Button>
                        {canSharePatient(patient) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(
                                e: React.MouseEvent<HTMLButtonElement>
                              ) => openEditDialog(patient, e)}
                            >
                              <Edit className="h-4 w-4 text-[#16808c]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(
                                e: React.MouseEvent<HTMLButtonElement>
                              ) => openShareDialog(patient.id, e)}
                            >
                              <Share2 className="h-4 w-4 text-[#16808c]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-[#a61f43] hover:text-[#a61f43] hover:bg-[#a61f43]/10"
                              onClick={(
                                e: React.MouseEvent<HTMLButtonElement>
                              ) => openDeleteDialog(patient.id, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{patient.careType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Pill className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {patient.medications} medicamentos
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserPlus className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {patient.caregivers} cuidador
                        {patient.caregivers > 1 ? "es" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {patient.createdAt
                          ? new Date(patient.createdAt).toLocaleString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : patient.lastUpdate}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        <span className="font-medium">Aniversário:</span>{" "}
                        {new Date(patient.birthDate).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 line-clamp-1 flex-1 min-w-0">
                      <span className="font-medium">Obs:</span>{" "}
                      {patient.observations}
                    </p>
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum paciente encontrado</p>
          </CardContent>
        </Card>
      )}

      {/* Medications by Time Dialog */}
      <Dialog
        open={medicationsDialogOpen}
        onOpenChange={setMedicationsDialogOpen}
      >
        <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#16808c]">
              Medicações do Dia - {selectedPatientForMedications?.name}
            </DialogTitle>
            <DialogDescription>
              Visualize as medicações organizadas por período do dia
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {Array.from(getMedicationsByTime.entries()).length > 0 ? (
              Array.from(getMedicationsByTime.entries()).map(
                ([time, meds]: [string, Medication[]]) => (
                  <div key={time}>
                    <div className="font-semibold text-[#16808c] mb-2">
                      {time}
                    </div>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      {meds.map((med: Medication, index: number) => {
                        // Calcular quantidade a ser exibida
                        let quantityText = "";
                        const presentationForm =
                          med.presentationForm || med.unit || "comprimido";
                        const timesCount = med.times.length || 1;

                        if (med.isHalfDose) {
                          // Se é meia dose, cada administração usa 1/2 comprimido
                          quantityText = "1/2";
                        } else {
                          // Calcular quantidade por horário baseado no consumo diário
                          // Se consumo diário é 1 e tem 1 horário = 1 comprimido por administração
                          // Se consumo diário é 1 e tem 2 horários = 0.5 comprimido por administração (meia dose)
                          const dailyConsumption = med.dailyConsumption || 1;
                          const quantityPerTime = dailyConsumption / timesCount;

                          // Se a quantidade for menor que 1, mostrar como fração ou decimal
                          if (quantityPerTime < 1) {
                            // Se for exatamente 0.5, mostrar como 1/2
                            if (quantityPerTime === 0.5) {
                              quantityText = "1/2";
                            } else {
                              quantityText = `${quantityPerTime}`;
                            }
                          } else {
                            // Arredondar para número inteiro ou mostrar decimal se necessário
                            quantityText =
                              quantityPerTime % 1 === 0
                                ? `${Math.round(quantityPerTime)}`
                                : `${quantityPerTime.toFixed(1)}`;
                          }
                        }

                        const unitLabel = getUnitLabel(presentationForm);
                        let frequencyText = "";
                        if (med.customFrequency) {
                          frequencyText = ` • ${med.customFrequency}`;
                        }
                        if (med.isExtra) {
                          frequencyText += " • Extra";
                        }

                        return (
                          <li
                            key={`${med.id}-${index}`}
                            className="text-sm text-gray-700"
                          >
                            {med.name} {med.dosage}
                            {getUnitLabel(med.dosageUnit || med.unit)} -{" "}
                            {quantityText} {unitLabel}
                            {frequencyText}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )
              )
            ) : (
              <p className="text-sm text-gray-500 italic">
                Nenhuma medicação cadastrada
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMedicationsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Medication to Patient Dialog */}
      <Dialog
        open={addMedicationDialogOpen}
        onOpenChange={setAddMedicationDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#16808c] text-2xl font-bold flex items-center gap-2">
              <Pill className="h-6 w-6" />
              Adicionar Medicação - {selectedPatientForAddMedication?.name}
            </DialogTitle>
            <DialogDescription>
              Selecione uma medicação existente ou crie uma nova e defina a
              posologia
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Seleção de Medicação */}
            <div className="bg-gradient-to-r from-[#16808c]/10 to-[#6cced9]/10 p-4 rounded-lg border-l-4 border-[#16808c]">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Pill className="h-5 w-5 text-[#16808c]" />
                Selecionar Medicação
              </h3>
              <Select
                value={newMedicationPosology.medicationId}
                onValueChange={(value: string) =>
                  setNewMedicationPosology({
                    ...newMedicationPosology,
                    medicationId: value,
                  })
                }
              >
                <SelectTrigger className="mt-2 h-11">
                  <SelectValue placeholder="Selecione uma medicação ou crie uma nova..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">➕ Criar Nova Medicação</SelectItem>
                  {allMedications
                    .filter((m: RawMedication) => {
                      // Filtrar medicações que já estão associadas a este paciente
                      const patientsList: Array<{
                        PatientId?: string;
                        patientId?: string;
                      }> = m.Patients || m.patients || [];
                      const isAssociated = patientsList.some(
                        (p) =>
                          (p.PatientId || p.patientId) ===
                          selectedPatientForAddMedication?.id
                      );
                      return !isAssociated;
                    })
                    .map((med: RawMedication) => {
                      const medId = med.Id || med.id;
                      const medName = med.Name || med.name;
                      const medDosage = med.Dosage || med.dosage;
                      const medUnit = med.DosageUnit || med.dosageUnit;
                      const medForm =
                        med.PresentationForm || med.presentationForm;
                      return (
                        <SelectItem key={medId} value={medId}>
                          {medName} {medDosage}
                          {medUnit} - {medForm}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
              {newMedicationPosology.medicationId === "new" && (
                <p className="text-sm text-blue-600 mt-2">
                  Você será redirecionado para a tela de medicações para criar
                  uma nova medicação.
                </p>
              )}
            </div>

            {/* Campos de Posologia */}
            {newMedicationPosology.medicationId &&
              newMedicationPosology.medicationId !== "new" && (
                <div className="space-y-6">
                  {/* Frequência e Horários */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#16808c]" />
                      Frequência e Horários
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="frequency">Frequência *</Label>
                        <Select
                          value={newMedicationPosology.frequency}
                          onValueChange={(value: string) =>
                            setNewMedicationPosology({
                              ...newMedicationPosology,
                              frequency: value,
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Diário">Diário</SelectItem>
                            <SelectItem value="Semanal">Semanal</SelectItem>
                            <SelectItem value="Mensal">Mensal</SelectItem>
                            <SelectItem value="Intervalar">
                              Intervalar
                            </SelectItem>
                            <SelectItem value="Variável">
                              Variável (tapering)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Horários *</Label>
                        <div className="space-y-2 mt-1">
                          {newMedicationPosology.times.map(
                            (time: string, idx: number) => (
                              <div key={idx} className="flex gap-2">
                                <Input
                                  type="time"
                                  value={time}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const copy = [
                                      ...newMedicationPosology.times,
                                    ];
                                    copy[idx] = e.target.value;
                                    setNewMedicationPosology({
                                      ...newMedicationPosology,
                                      times: copy,
                                    });
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const copy = [
                                      ...newMedicationPosology.times,
                                    ];
                                    copy.splice(idx, 1);
                                    setNewMedicationPosology({
                                      ...newMedicationPosology,
                                      times: copy,
                                    });
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setNewMedicationPosology({
                                ...newMedicationPosology,
                                times: [...newMedicationPosology.times, ""],
                              })
                            }
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Horário
                          </Button>
                        </div>
                      </div>

                      {newMedicationPosology.frequency === "Intervalar" && (
                        <div>
                          <Label htmlFor="customFrequency">
                            Frequência Personalizada
                          </Label>
                          <Input
                            id="customFrequency"
                            value={newMedicationPosology.customFrequency}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              setNewMedicationPosology({
                                ...newMedicationPosology,
                                customFrequency: e.target.value,
                              })
                            }
                            placeholder="Ex: a cada 2 dias"
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isHalfDose"
                          checked={newMedicationPosology.isHalfDose}
                          onCheckedChange={(checked: CheckedState) =>
                            setNewMedicationPosology({
                              ...newMedicationPosology,
                              isHalfDose: checked === true,
                            })
                          }
                        />
                        <Label
                          htmlFor="isHalfDose"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Meia dose (1/2 comprimido por administração)
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isExtra"
                          checked={newMedicationPosology.isExtra}
                          onCheckedChange={(checked: CheckedState) =>
                            setNewMedicationPosology({
                              ...newMedicationPosology,
                              isExtra: checked === true,
                            })
                          }
                        />
                        <Label
                          htmlFor="isExtra"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Medicação extra/avulsa
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Tratamento */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#16808c]" />
                      Tratamento
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="treatmentType">
                          Tipo de Tratamento *
                        </Label>
                        <Select
                          value={newMedicationPosology.treatmentType}
                          onValueChange={(value: "continuo" | "temporario") =>
                            setNewMedicationPosology({
                              ...newMedicationPosology,
                              treatmentType: value,
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="continuo">Contínuo</SelectItem>
                            <SelectItem value="temporario">
                              Temporário
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="startDate">Data de Início *</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={newMedicationPosology.treatmentStartDate}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              setNewMedicationPosology({
                                ...newMedicationPosology,
                                treatmentStartDate: e.target.value,
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                        {newMedicationPosology.treatmentType ===
                          "temporario" && (
                          <div>
                            <Label htmlFor="endDate">Data de Término</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={newMedicationPosology.treatmentEndDate}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                setNewMedicationPosology({
                                  ...newMedicationPosology,
                                  treatmentEndDate: e.target.value,
                                })
                              }
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasTapering"
                          checked={newMedicationPosology.hasTapering}
                          onCheckedChange={(checked: CheckedState) =>
                            setNewMedicationPosology({
                              ...newMedicationPosology,
                              hasTapering: checked === true,
                            })
                          }
                        />
                        <Label
                          htmlFor="hasTapering"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Tem tapering (redução gradual)
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Consumo Diário */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Package className="h-4 w-4 text-[#16808c]" />
                      Consumo Diário
                    </h4>
                    <div>
                      <Label htmlFor="dailyConsumption">
                        Consumo Diário (quantidade por dia) *
                      </Label>
                      <Input
                        id="dailyConsumption"
                        type="number"
                        step="0.01"
                        value={newMedicationPosology.dailyConsumption}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewMedicationPosology({
                            ...newMedicationPosology,
                            dailyConsumption: e.target.value,
                          })
                        }
                        placeholder="Ex: 2 (para 2 comprimidos por dia)"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Informe a quantidade total consumida por dia (ex: 2 para
                        2 comprimidos, 1.5 para 1 comprimido e meio)
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>

          <DialogFooter className="border-t pt-4 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setAddMedicationDialogOpen(false);
                setNewMedicationPosology({
                  medicationId: "",
                  frequency: "",
                  times: [],
                  isHalfDose: false,
                  customFrequency: "",
                  isExtra: false,
                  treatmentType: "continuo",
                  treatmentStartDate: new Date().toISOString().split("T")[0],
                  treatmentEndDate: "",
                  hasTapering: false,
                  dailyConsumption: "",
                  prescriptionId: "",
                });
              }}
            >
              Cancelar
            </Button>
            {newMedicationPosology.medicationId === "new" && (
              <Button
                onClick={() => {
                  setAddMedicationDialogOpen(false);
                  // Redirecionar para tela de medicações
                  window.location.href = "#medications";
                }}
                className="bg-[#16808c] hover:bg-[#16808c]/90"
              >
                Ir para Medicações
              </Button>
            )}
            {newMedicationPosology.medicationId &&
              newMedicationPosology.medicationId !== "new" && (
                <Button
                  onClick={async () => {
                    if (
                      !newMedicationPosology.medicationId ||
                      !newMedicationPosology.frequency ||
                      newMedicationPosology.times.length === 0 ||
                      !newMedicationPosology.dailyConsumption
                    ) {
                      toast.error("Preencha todos os campos obrigatórios");
                      return;
                    }

                    try {
                      await apiFetch(`/medications/add-to-patient`, {
                        method: "POST",
                        body: JSON.stringify({
                          medicationId: newMedicationPosology.medicationId,
                          patientId: selectedPatientForAddMedication?.id,
                          frequency: newMedicationPosology.frequency,
                          times: newMedicationPosology.times,
                          isHalfDose: newMedicationPosology.isHalfDose,
                          customFrequency:
                            newMedicationPosology.customFrequency || null,
                          isExtra: newMedicationPosology.isExtra,
                          treatmentType:
                            newMedicationPosology.treatmentType === "continuo"
                              ? 0
                              : 1,
                          treatmentStartDate:
                            newMedicationPosology.treatmentStartDate,
                          treatmentEndDate:
                            newMedicationPosology.treatmentEndDate || null,
                          hasTapering: newMedicationPosology.hasTapering,
                          dailyConsumption:
                            parseFloat(
                              newMedicationPosology.dailyConsumption
                            ) || 0,
                          prescriptionId:
                            newMedicationPosology.prescriptionId || null,
                        }),
                      });

                      toast.success(
                        "Medicação adicionada ao paciente com sucesso!"
                      );
                      setAddMedicationDialogOpen(false);
                      setNewMedicationPosology({
                        medicationId: "",
                        frequency: "",
                        times: [],
                        isHalfDose: false,
                        customFrequency: "",
                        isExtra: false,
                        treatmentType: "continuo",
                        treatmentStartDate: new Date()
                          .toISOString()
                          .split("T")[0],
                        treatmentEndDate: "",
                        hasTapering: false,
                        dailyConsumption: "",
                        prescriptionId: "",
                      });
                      // Recarregar dados
                      window.location.reload();
                    } catch (error: any) {
                      console.error(
                        "Erro ao adicionar medicação ao paciente:",
                        error
                      );
                      toast.error(
                        error?.message ||
                          "Erro ao adicionar medicação ao paciente"
                      );
                    }
                  }}
                  className="bg-[#16808c] hover:bg-[#16808c]/90"
                >
                  Adicionar Medicação
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
