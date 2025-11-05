import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { apiFetch } from "../lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Plus,
  Search,
  Pill,
  Clock,
  Calendar,
  Package,
  AlertTriangle,
  Edit,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Info,
  Trash2,
  X,
  FileText,
  CheckCircle2,
  User,
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
import { toast } from "sonner@2.0.3";
import {
  useData,
  MedicationUnit,
  TreatmentType,
  TaperingSchedule,
  DosageUnit,
  PresentationForm,
} from "./DataContext";

export function MedicationsPage() {
  const {
    medications,
    patients,
    addMedication,
    updateMedication,
    deleteMedication,
  } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("all");
  const [editingMedication, setEditingMedication] = useState<
    (typeof medications)[0] | null
  >(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState<string | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState(1); // Para o wizard de cadastro
  const [editStep, setEditStep] = useState(1); // Para o wizard de edição

  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    dosageUnit: "mg" as DosageUnit, // Unidade de medida da dosagem
    presentationForm: "comprimido" as PresentationForm, // Forma de apresentação
    unit: "comprimido" as MedicationUnit, // Mantido para compatibilidade
    patient: "",
    patientId: "",
    administrationRoute: "",
    frequency: "",
    times: [] as string[],
<<<<<<< HEAD
    isHalfDose: false, // Meia dose (1/2 comprimido por administração)
    customFrequency: "", // Frequência personalizada (ex: "a cada 2 dias")
    isExtra: false, // Medicação extra/avulsa
    prescriptionId: "", // ID da receita associada (opcional)
=======
    prescriptionType: "",
>>>>>>> master
    treatmentType: "continuo" as TreatmentType,
    treatmentStartDate: "",
    treatmentEndDate: "",
    hasTapering: false,
    taperingSchedule: [] as TaperingSchedule[],
    boxQuantity: "",
    currentStock: "",
    dailyConsumption: "",
    instructions: "",
  });

  // Memoized filtered medications para performance
  const filteredMedications = useMemo(() => {
    return medications.filter((med) => {
      const matchesSearch =
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.patient.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPatient =
        selectedPatient === "all" || med.patientId === selectedPatient;
      return matchesSearch && matchesPatient;
    });
  }, [medications, searchTerm, selectedPatient]);

  // Memoized stats para performance
  const stats = useMemo(() => {
    const total = medications.length;
    const normal = medications.filter((m) => m.status === "ok").length;
    const warning = medications.filter((m) => m.status === "warning").length;
    const critical = medications.filter((m) => m.status === "critical").length;
    const temporary = medications.filter(
      (m) => m.treatmentType === "temporario"
    ).length;
    const withTapering = medications.filter((m) => m.hasTapering).length;

    return { total, normal, warning, critical, temporary, withTapering };
  }, [medications]);

  const handleAddMedication = () => {
    if (
      !newMedication.name ||
      !newMedication.dosage ||
      !newMedication.dosageUnit ||
      !newMedication.presentationForm
    ) {
      toast.error(
        "Preencha todos os campos obrigatórios (nome, dosagem e forma de apresentação)"
      );
      return;
    }

    const initialStock = parseFloat(newMedication.currentStock) || 0; // Estoque inicial será registrado como movimentação

    // Adicionar apenas informações da medicação (sem posologia)
    // A posologia será adicionada posteriormente através da tela do paciente
    // Usar apiFetch diretamente para enviar apenas os dados necessários
    apiFetch(`/medications`, {
      method: "POST",
      body: JSON.stringify({
        name: newMedication.name,
        dosage: parseFloat(newMedication.dosage) || 0,
        dosageUnit: newMedication.dosageUnit,
        presentationForm: newMedication.presentationForm,
        route: newMedication.administrationRoute,
        initialStock: initialStock,
        boxQuantity: parseFloat(newMedication.boxQuantity) || 0,
        instructions: newMedication.instructions,
      }),
    })
      .then(() => {
        toast.success(
          "Medicamento adicionado com sucesso! Agora você pode adicionar a posologia através da tela do paciente."
        );
        setIsAddDialogOpen(false);
        setCurrentStep(1); // Reset para primeira etapa
        setNewMedication({
          name: "",
          dosage: "",
          dosageUnit: "mg" as DosageUnit,
          presentationForm: "comprimido" as PresentationForm,
          unit: "comprimido" as MedicationUnit,
          patient: "",
          patientId: "",
          administrationRoute: "",
          frequency: "",
          times: [],
          isHalfDose: false,
          customFrequency: "",
          isExtra: false,
          prescriptionId: "",
          treatmentType: "continuo",
          treatmentStartDate: "",
          treatmentEndDate: "",
          hasTapering: false,
          taperingSchedule: [],
          boxQuantity: "",
          currentStock: "",
          dailyConsumption: "",
          instructions: "",
        });
      })
      .catch((error) => {
        console.error("Erro ao adicionar medicação:", error);
        toast.error("Erro ao adicionar medicação. Tente novamente.");
      });
  };

  // Abrir dialog de edição
  const handleEditClick = (medication: (typeof medications)[0]) => {
    setEditingMedication(medication);
    setEditStep(1); // Reset para primeira etapa
    setNewMedication({
      name: medication.name,
      dosage: String(medication.dosage),
      dosageUnit: medication.dosageUnit || ("mg" as DosageUnit),
      presentationForm:
        medication.presentationForm || ("comprimido" as PresentationForm),
      unit: medication.unit || ("comprimido" as MedicationUnit),
      patient: medication.patient,
      patientId: medication.patientId,
      administrationRoute: medication.route,
      frequency: medication.frequency,
      times: medication.times || [],
      isHalfDose: medication.isHalfDose || false,
      customFrequency: medication.customFrequency || "",
      isExtra: medication.isExtra || false,
      prescriptionId: medication.prescriptionId || "",
      treatmentType: medication.treatmentType,
      treatmentStartDate: medication.treatmentStartDate,
      treatmentEndDate: medication.treatmentEndDate || "",
      hasTapering: medication.hasTapering,
      taperingSchedule: medication.taperingSchedule || [],
      boxQuantity: String(medication.boxQuantity),
      currentStock: String(medication.currentStock),
      dailyConsumption: String(medication.dailyConsumption),
      instructions: medication.instructions || "",
    });
    setIsEditDialogOpen(true);
  };

  // Salvar edição
  const handleSaveEdit = () => {
    if (
      !editingMedication ||
      !newMedication.name ||
      !newMedication.patientId ||
      !newMedication.dosage ||
      !newMedication.dosageUnit ||
      !newMedication.presentationForm
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const patientData = patients.find((p) => p.id === newMedication.patientId);
    if (!patientData) return;

    const dailyConsumption = parseFloat(newMedication.dailyConsumption) || 0;

<<<<<<< HEAD
    const timesArray = (newMedication.times || [])
      .map((t) => t.trim())
      .filter(Boolean);

    // Ao editar, não alteramos o estoque - ele é gerenciado apenas pelas movimentações
    // Mapear treatmentType de string para número (0 = continuo, 1 = temporario)
    const treatmentTypeMap: Record<string, number> = {
      continuo: 0,
      temporario: 1,
    };

    updateMedication(editingMedication.id, {
=======
    const timesArray = (newMedication.times || []).map(t => t.trim()).filter(Boolean);
    addMedication({
>>>>>>> master
      name: newMedication.name,
      dosage: parseFloat(newMedication.dosage) || 0,
      dosageUnit: newMedication.dosageUnit,
      presentationForm: newMedication.presentationForm,
      unit: newMedication.dosageUnit, // Mantido para compatibilidade
      patient: patientData.name,
      patientId: newMedication.patientId,
      route: newMedication.administrationRoute,
      frequency: newMedication.frequency,
      times: timesArray,
<<<<<<< HEAD
      isHalfDose: newMedication.isHalfDose,
      customFrequency: newMedication.customFrequency || undefined,
      isExtra: newMedication.isExtra,
      prescriptionId: newMedication.prescriptionId || undefined,
      treatmentType: newMedication.treatmentType, // Já está como string "continuo" ou "temporario"
      treatmentStartDate:
        newMedication.treatmentStartDate ||
        new Date().toISOString().split("T")[0],
=======
      prescriptionType: newMedication.prescriptionType,
      prescriptionExpiry: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      treatmentType: newMedication.treatmentType,
      treatmentStartDate: newMedication.treatmentStartDate,
>>>>>>> master
      treatmentEndDate: newMedication.treatmentEndDate,
      hasTapering: newMedication.hasTapering,
      taperingSchedule: newMedication.taperingSchedule,
      currentTaperingPhase:
        newMedication.hasTapering && newMedication.taperingSchedule.length > 0
          ? newMedication.taperingSchedule[0].phase
          : undefined,
      dailyConsumption,
      boxQuantity: parseFloat(newMedication.boxQuantity) || 0,
      instructions: newMedication.instructions,
      // currentStock e daysLeft não são atualizados - são calculados a partir das movimentações
    });

    toast.success("Medicamento atualizado com sucesso!");
    setIsEditDialogOpen(false);
    setEditingMedication(null);
    setEditStep(1); // Reset para primeira etapa
    setNewMedication({
      name: "",
      dosage: "",
      dosageUnit: "mg" as DosageUnit,
      presentationForm: "comprimido" as PresentationForm,
      unit: "comprimido" as MedicationUnit,
      patient: "",
      patientId: "",
      administrationRoute: "",
      frequency: "",
      times: [],
<<<<<<< HEAD
      isHalfDose: false,
      customFrequency: "",
      isExtra: false,
      prescriptionId: "",
=======
      prescriptionType: "",
>>>>>>> master
      treatmentType: "continuo",
      treatmentStartDate: "",
      treatmentEndDate: "",
      hasTapering: false,
      taperingSchedule: [],
      boxQuantity: "",
      currentStock: "",
      dailyConsumption: "",
      instructions: "",
    });
  };

  // Abrir dialog de exclusão
  const openDeleteDialog = (medicationId: string) => {
    setMedicationToDelete(medicationId);
    setDeleteDialogOpen(true);
  };

  // Confirmar exclusão
  const handleDeleteMedication = async () => {
    if (!medicationToDelete) return;

    try {
      await deleteMedication(medicationToDelete);
      toast.success("Medicamento excluído com sucesso!");
      setDeleteDialogOpen(false);
      setMedicationToDelete(null);
    } catch (error) {
      toast.error("Erro ao excluir medicamento.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-[#a61f43] text-white";
      case "warning":
        return "bg-[#f2c36b] text-white";
      default:
        return "bg-[#a0bf80] text-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "critical":
        return "Crítico";
      case "warning":
        return "Atenção";
      default:
        return "Normal";
    }
  };

  const getTaperingIcon = (phase: string | undefined) => {
    if (!phase) return null;
    switch (phase) {
      case "aumento":
        return <TrendingUp className="h-4 w-4 text-[#6cced9]" />;
      case "reducao":
        return <TrendingDown className="h-4 w-4 text-[#f2c36b]" />;
      default:
        return null;
    }
  };

  const getUnitLabel = (unit: MedicationUnit) => {
    const labels: Record<MedicationUnit, string> = {
      comprimido: "comp",
      ml: "ml",
      gotas: "gts",
      mg: "mg",
      g: "g",
      aplicacao: "apl",
      inalacao: "inal",
    };
    return labels[unit] || unit;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#16808c]">Medicamentos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie todas as medicações dos pacientes
          </p>
        </div>

        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) setCurrentStep(1); // Reset ao fechar
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-[#16808c] hover:bg-[#16808c]/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Medicamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-6 border-b border-gray-200">
              <DialogTitle className="text-[#16808c] text-2xl font-bold flex items-center gap-2">
                <Pill className="h-6 w-6" />
                Novo Medicamento
              </DialogTitle>
              {/* Indicador de etapas melhorado */}
              <div className="flex items-center justify-between mt-6">
                {[
                  { num: 1, label: "Básico", icon: Info },
                  { num: 2, label: "Administração", icon: Clock },
                  { num: 3, label: "Estoque", icon: Package },
                  { num: 4, label: "Observações", icon: FileText },
                ].map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.num;
                  const isCompleted = currentStep > step.num;
                  return (
                    <div key={step.num} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                            isActive
                              ? "bg-[#16808c] border-[#16808c] text-white shadow-lg scale-110"
                              : isCompleted
                              ? "bg-[#16808c] border-[#16808c] text-white"
                              : "bg-white border-gray-300 text-gray-400"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium ${
                            isActive
                              ? "text-[#16808c]"
                              : isCompleted
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {idx < 3 && (
                        <div
                          className={`flex-1 h-1 mx-3 -mt-6 rounded-full transition-all ${
                            currentStep > step.num
                              ? "bg-[#16808c]"
                              : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </DialogHeader>

<<<<<<< HEAD
            <div className="flex-1 overflow-y-auto py-6 px-1">
              {/* Etapa 1: Informações Básicas */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-[#16808c]/10 to-[#6cced9]/10 p-4 rounded-lg border-l-4 border-[#16808c]">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <Info className="h-5 w-5 text-[#16808c]" />
                      Informações Básicas
                    </h3>
                    <p className="text-sm text-gray-600">
                      Preencha os dados fundamentais do medicamento
                    </p>
=======
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit">Unidade de Medida *</Label>
                  <Select
                    value={newMedication.unit}
                    onValueChange={(value: MedicationUnit) => setNewMedication({ ...newMedication, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprimido">Comprimido</SelectItem>
                      <SelectItem value="ml">Mililitros (ml)</SelectItem>
                      <SelectItem value="gotas">Gotas</SelectItem>
                      <SelectItem value="mg">Miligramas (mg)</SelectItem>
                      <SelectItem value="g">Gramas (g)</SelectItem>
                      <SelectItem value="aplicacao">Aplicação</SelectItem>
                      <SelectItem value="inalacao">Inalação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="patient">Paciente *</Label>
                  <Select
                    value={newMedication.patientId}
                    onValueChange={(value) => {
                      const patient = patients.find(p => p.id === value);
                      setNewMedication({ 
                        ...newMedication, 
                        patientId: value,
                        patient: patient?.name || ""
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Administration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="route">Via de Administração</Label>
                  <Select
                    value={newMedication.administrationRoute}
                    onValueChange={(value) => setNewMedication({ ...newMedication, administrationRoute: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oral">Oral</SelectItem>
                      <SelectItem value="Oral (gotas)">Oral (gotas)</SelectItem>
                      <SelectItem value="Tópica">Tópica</SelectItem>
                      <SelectItem value="Injetável">Injetável</SelectItem>
                      <SelectItem value="Sublingual">Sublingual</SelectItem>
                      <SelectItem value="Inalatória">Inalatória</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="prescription-type">Tipo de Receita</Label>
                  <Select
                    value={newMedication.prescriptionType}
                    onValueChange={(value) => setNewMedication({ ...newMedication, prescriptionType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Simples">Simples</SelectItem>
                      <SelectItem value="B">Tipo B</SelectItem>
                      <SelectItem value="C1">Tipo C1</SelectItem>
                      <SelectItem value="C2">Tipo C2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Frequency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequência</Label>
                  <Select
                    value={newMedication.frequency}
                    onValueChange={(value) => setNewMedication({ ...newMedication, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Diário">Diário</SelectItem>
                      <SelectItem value="Semanal">Semanal</SelectItem>
                      <SelectItem value="Mensal">Mensal</SelectItem>
                      <SelectItem value="Intervalar">Intervalar</SelectItem>
                      <SelectItem value="Variável">Variável (tapering)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Horários</Label>
                  <div className="space-y-2">
                    {(newMedication.times || []).map((t, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          type="time"
                          value={t}
                          onChange={(e) => {
                            const copy = [...newMedication.times];
                            copy[idx] = e.target.value;
                            setNewMedication({ ...newMedication, times: copy });
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const copy = [...newMedication.times];
                            copy.splice(idx, 1);
                            setNewMedication({ ...newMedication, times: copy });
                          }}
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setNewMedication({ ...newMedication, times: [...(newMedication.times || []), ""] })}
                    >
                      Adicionar horário
                    </Button>
                  </div>
                </div>
              </div>

              {/* Treatment Type */}
              <div className="p-4 bg-[#F5F5F5] rounded-lg space-y-4">
                <div>
                  <Label htmlFor="treatment-type">Tipo de Tratamento</Label>
                  <Select
                    value={newMedication.treatmentType}
                    onValueChange={(value: TreatmentType) => setNewMedication({ ...newMedication, treatmentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="continuo">Contínuo (uso permanente)</SelectItem>
                      <SelectItem value="temporario">Temporário (início e fim)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Data de Início</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newMedication.treatmentStartDate}
                      onChange={(e) => setNewMedication({ ...newMedication, treatmentStartDate: e.target.value })}
                    />
>>>>>>> master
                  </div>

                  <div className="space-y-5">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <Label
                        htmlFor="med-name"
                        className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                      >
                        <Pill className="h-4 w-4 text-[#16808c]" />
                        Nome do Medicamento *
                      </Label>
                      <Input
                        id="med-name"
                        value={newMedication.name}
                        onChange={(e) =>
                          setNewMedication({
                            ...newMedication,
                            name: e.target.value,
                          })
                        }
                        placeholder="Ex: Losartana"
                        className="mt-2 h-11"
                      />
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <Label
                          htmlFor="dosage"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Dosagem *
                        </Label>
                        <Input
                          id="dosage"
                          type="number"
                          step="0.01"
                          value={newMedication.dosage}
                          onChange={(e) =>
                            setNewMedication({
                              ...newMedication,
                              dosage: e.target.value,
                            })
                          }
                          placeholder="Ex: 15"
                          className="mt-2 h-11"
                        />
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <Label
                          htmlFor="dosage-unit"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Unidade *
                        </Label>
                        <Select
                          value={newMedication.dosageUnit}
                          onValueChange={(value: DosageUnit) =>
                            setNewMedication({
                              ...newMedication,
                              dosageUnit: value,
                            })
                          }
                        >
                          <SelectTrigger className="mt-2 h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mg">mg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="mcg">mcg</SelectItem>
                            <SelectItem value="ui">UI</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <Label
                        htmlFor="presentation-form"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Forma de Apresentação *
                      </Label>
                      <Select
                        value={newMedication.presentationForm}
                        onValueChange={(value: PresentationForm) =>
                          setNewMedication({
                            ...newMedication,
                            presentationForm: value,
                          })
                        }
                      >
                        <SelectTrigger className="mt-2 h-11">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comprimido">Comprimido</SelectItem>
                          <SelectItem value="capsula">Cápsula</SelectItem>
                          <SelectItem value="gotas">Gotas</SelectItem>
                          <SelectItem value="xarope">Xarope</SelectItem>
                          <SelectItem value="suspensao">Suspensão</SelectItem>
                          <SelectItem value="ampola">Ampola</SelectItem>
                          <SelectItem value="aplicacao">Aplicação</SelectItem>
                          <SelectItem value="inalacao">Inalação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 2: Administração */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Via de Administração
                    </h3>
                    <p className="text-sm text-gray-600">
                      Informe como o medicamento será administrado
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <Label htmlFor="route" className="text-sm font-semibold text-gray-700">
                        Via de Administração *
                      </Label>
                      <Select
                        value={newMedication.administrationRoute}
                        onValueChange={(value) =>
                          setNewMedication({
                            ...newMedication,
                            administrationRoute: value,
                          })
                        }
                      >
                        <SelectTrigger className="mt-2 h-11">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Oral">Oral</SelectItem>
                          <SelectItem value="Oral (gotas)">
                            Oral (gotas)
                          </SelectItem>
                          <SelectItem value="Tópica">Tópica</SelectItem>
                          <SelectItem value="Injetável">Injetável</SelectItem>
                          <SelectItem value="Sublingual">Sublingual</SelectItem>
                          <SelectItem value="Inalatória">Inalatória</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Nota:</strong> A posologia (frequência, horários, quantidade) será definida quando você associar esta medicação a um paciente na tela do paciente.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 3: Estoque */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-l-4 border-green-500">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <Package className="h-5 w-5 text-green-600" />
                      Controle de Estoque
                    </h3>
                    <p className="text-sm text-gray-600">
                      Configure o estoque inicial e quantidade por embalagem
                    </p>
                  </div>

                  <div className="space-y-5">

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <Label
                          htmlFor="box-quantity"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Qtd. por Embalagem
                        </Label>
                        <Input
                          id="box-quantity"
                          type="number"
                          step="0.01"
                          value={newMedication.boxQuantity}
                          onChange={(e) =>
                            setNewMedication({
                              ...newMedication,
                              boxQuantity: e.target.value,
                            })
                          }
                          placeholder="Ex: 30"
                          className="mt-2 h-11"
                        />
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <Label
                          htmlFor="current-stock"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Estoque Inicial *
                        </Label>
                        <p className="text-xs text-gray-500 mt-1 mb-2">
                          Registrado como movimentação de entrada
                        </p>
                        <Input
                          id="current-stock"
                          type="number"
                          step="0.01"
                          value={newMedication.currentStock}
                          onChange={(e) =>
                            setNewMedication({
                              ...newMedication,
                              currentStock: e.target.value,
                            })
                          }
                          placeholder="Ex: 60"
                          className="h-11"
                        />
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <Label
                          htmlFor="daily-consumption"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Consumo Diário *
                        </Label>
                        <Input
                          id="daily-consumption"
                          type="number"
                          step="0.01"
                          value={newMedication.dailyConsumption}
                          onChange={(e) =>
                            setNewMedication({
                              ...newMedication,
                              dailyConsumption: e.target.value,
                            })
                          }
                          placeholder="Ex: 2"
                          className="mt-2 h-11"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        id="hasTapering"
                        checked={newMedication.hasTapering}
                        onCheckedChange={(checked) =>
                          setNewMedication({
                            ...newMedication,
                            hasTapering: checked as boolean,
                          })
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="hasTapering"
                          className="cursor-pointer text-sm"
                        >
                          Este medicamento tem desmame (tapering)
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 4: Observações */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      Observações e Instruções
                    </h3>
                    <p className="text-sm text-gray-600">
                      Adicione informações importantes sobre o medicamento
                      (opcional)
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <Label
                      htmlFor="instructions"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Instruções e Observações
                    </Label>
                    <Textarea
                      id="instructions"
                      value={newMedication.instructions}
                      onChange={(e) =>
                        setNewMedication({
                          ...newMedication,
                          instructions: e.target.value,
                        })
                      }
                      placeholder="Ex: Tomar com alimentos, evitar leite, não tomar com outros medicamentos..."
                      rows={8}
                      className="mt-3 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Use este campo para adicionar informações importantes
                      sobre administração, interações ou cuidados especiais.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="border-t border-gray-200 pt-5 bg-gray-50">
              <div className="flex justify-between w-full">
                <Button
                  variant="outline"
                  onClick={() =>
                    currentStep === 1
                      ? setIsAddDialogOpen(false)
                      : setCurrentStep(currentStep - 1)
                  }
                  className="h-11 px-6"
                >
                  {currentStep === 1 ? "Cancelar" : "← Voltar"}
                </Button>
                <div className="flex gap-3">
                  {currentStep < 4 && (
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="bg-[#16808c] hover:bg-[#16808c]/90 h-11 px-6 shadow-md"
                    >
                      Próximo →
                    </Button>
                  )}
                  {currentStep === 4 && (
                    <Button
                      className="bg-[#16808c] hover:bg-[#16808c]/90 h-11 px-8 shadow-md flex items-center gap-2"
                      onClick={handleAddMedication}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Adicionar Medicamento
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição */}
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setEditStep(1); // Reset ao fechar
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-[#16808c] text-xl">
                Editar Medicamento
              </DialogTitle>
              {/* Indicador de etapas */}
              <div className="flex items-center justify-between mt-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        editStep === step
                          ? "bg-[#16808c] border-[#16808c] text-white"
                          : editStep > step
                          ? "bg-[#16808c] border-[#16808c] text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      {editStep > step ? (
                        <ArrowRight className="h-4 w-4" />
                      ) : (
                        step
                      )}
                    </div>
                    {step < 4 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          editStep > step ? "bg-[#16808c]" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-6">
              {/* Etapa 1: Informações Básicas */}
              {editStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Informações Básicas
                    </h3>
                    <p className="text-sm text-gray-500">
                      Nome, paciente e dosagem
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-med-name">
                        Nome do Medicamento *
                      </Label>
                      <Input
                        id="edit-med-name"
                        value={newMedication.name}
                        onChange={(e) =>
                          setNewMedication({
                            ...newMedication,
                            name: e.target.value,
                          })
                        }
                        placeholder="Ex: Losartana"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-patient">Paciente *</Label>
                      <Select
                        value={newMedication.patientId}
                        onValueChange={(value) => {
                          const patient = patients.find((p) => p.id === value);
                          setNewMedication({
                            ...newMedication,
                            patientId: value,
                            patient: patient?.name || "",
                          });
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione o paciente..." />
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

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="edit-dosage">Dosagem *</Label>
                        <Input
                          id="edit-dosage"
                          type="number"
                          step="0.01"
                          value={newMedication.dosage}
                          onChange={(e) =>
                            setNewMedication({
                              ...newMedication,
                              dosage: e.target.value,
                            })
                          }
                          placeholder="Ex: 15"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-dosage-unit">Unidade *</Label>
                        <Select
                          value={newMedication.dosageUnit}
                          onValueChange={(value: DosageUnit) =>
                            setNewMedication({
                              ...newMedication,
                              dosageUnit: value,
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mg">mg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="mcg">mcg</SelectItem>
                            <SelectItem value="ui">UI</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-presentation-form">
                        Forma de Apresentação *
                      </Label>
                      <Select
                        value={newMedication.presentationForm}
                        onValueChange={(value: PresentationForm) =>
                          setNewMedication({
                            ...newMedication,
                            presentationForm: value,
                          })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comprimido">Comprimido</SelectItem>
                          <SelectItem value="capsula">Cápsula</SelectItem>
                          <SelectItem value="gotas">Gotas</SelectItem>
                          <SelectItem value="xarope">Xarope</SelectItem>
                          <SelectItem value="suspensao">Suspensão</SelectItem>
                          <SelectItem value="ampola">Ampola</SelectItem>
                          <SelectItem value="aplicacao">Aplicação</SelectItem>
                          <SelectItem value="inalacao">Inalação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 2: Administração */}
              {editStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Administração
                    </h3>
                    <p className="text-sm text-gray-500">
                      Via, frequência e horários
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-route">Via de Administração *</Label>
                      <Select
                        value={newMedication.administrationRoute}
                        onValueChange={(value) =>
                          setNewMedication({
                            ...newMedication,
                            administrationRoute: value,
                          })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Oral">Oral</SelectItem>
                          <SelectItem value="Oral (gotas)">
                            Oral (gotas)
                          </SelectItem>
                          <SelectItem value="Tópica">Tópica</SelectItem>
                          <SelectItem value="Injetável">Injetável</SelectItem>
                          <SelectItem value="Sublingual">Sublingual</SelectItem>
                          <SelectItem value="Inalatória">Inalatória</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="edit-frequency">Frequência *</Label>
                      <Select
                        value={newMedication.frequency}
                        onValueChange={(value) =>
                          setNewMedication({
                            ...newMedication,
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
                          <SelectItem value="Intervalar">Intervalar</SelectItem>
                          <SelectItem value="Variável">
                            Variável (tapering)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Horários *</Label>
                      <div className="space-y-2 mt-1">
                        {(newMedication.times || []).map((t, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              type="time"
                              value={t}
                              onChange={(e) => {
                                const copy = [...newMedication.times];
                                copy[idx] = e.target.value;
                                setNewMedication({
                                  ...newMedication,
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
                                const copy = [...newMedication.times];
                                copy.splice(idx, 1);
                                setNewMedication({
                                  ...newMedication,
                                  times: copy,
                                });
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setNewMedication({
                              ...newMedication,
                              times: [...(newMedication.times || []), ""],
                            })
                          }
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Horário
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Checkbox
                        id="edit-isHalfDose"
                        checked={newMedication.isHalfDose}
                        onCheckedChange={(checked) =>
                          setNewMedication({
                            ...newMedication,
                            isHalfDose: checked === true,
                          })
                        }
                      />
                      <Label
                        htmlFor="edit-isHalfDose"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Meia dose (1/2 comprimido por administração)
                      </Label>
                      <p className="text-xs text-gray-500 ml-6">
                        Marque se cada administração usa apenas 1/2 comprimido
                        ao invés de 1 inteiro
                      </p>
                    </div>

                    {newMedication.frequency === "Intervalar" && (
                      <div>
                        <Label htmlFor="edit-customFrequency">
                          Frequência Personalizada
                        </Label>
                        <Input
                          id="edit-customFrequency"
                          value={newMedication.customFrequency}
                          onChange={(e) =>
                            setNewMedication({
                              ...newMedication,
                              customFrequency: e.target.value,
                            })
                          }
                          placeholder="Ex: a cada 2 dias"
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Informe a frequência personalizada (ex: "a cada 2
                          dias", "3x por semana")
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Checkbox
                        id="edit-isExtra"
                        checked={newMedication.isExtra}
                        onCheckedChange={(checked) =>
                          setNewMedication({
                            ...newMedication,
                            isExtra: checked === true,
                          })
                        }
                      />
                      <Label
                        htmlFor="edit-isExtra"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Medicação extra/avulsa
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 3: Tratamento e Estoque */}
              {editStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Tratamento e Estoque
                    </h3>
                    <p className="text-sm text-gray-500">
                      Tipo de tratamento e informações de estoque
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-treatment-type">
                        Tipo de Tratamento *
                      </Label>
                      <Select
                        value={newMedication.treatmentType}
                        onValueChange={(value: TreatmentType) =>
                          setNewMedication({
                            ...newMedication,
                            treatmentType: value,
                          })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="continuo">Contínuo</SelectItem>
                          <SelectItem value="temporario">Temporário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="edit-start-date">
                          Data de Início *
                        </Label>
                        <Input
                          id="edit-start-date"
                          type="date"
                          value={newMedication.treatmentStartDate}
                          onChange={(e) =>
                            setNewMedication({
                              ...newMedication,
                              treatmentStartDate: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                      {newMedication.treatmentType === "temporario" && (
                        <div>
                          <Label htmlFor="edit-end-date">Data de Término</Label>
                          <Input
                            id="edit-end-date"
                            type="date"
                            value={newMedication.treatmentEndDate}
                            onChange={(e) =>
                              setNewMedication({
                                ...newMedication,
                                treatmentEndDate: e.target.value,
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="edit-box-quantity">
                          Qtd. por Embalagem
                        </Label>
                        <Input
                          id="edit-box-quantity"
                          type="number"
                          step="0.01"
                          value={newMedication.boxQuantity}
                          onChange={(e) =>
                            setNewMedication({
                              ...newMedication,
                              boxQuantity: e.target.value,
                            })
                          }
                          placeholder="Ex: 30"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                          <p className="font-medium mb-1">
                            Estoque Atual:{" "}
                            {editingMedication?.currentStock || 0}{" "}
                            {getUnitLabel(
                              editingMedication?.presentationForm ||
                                editingMedication?.unit ||
                                "comprimido"
                            )}
                          </p>
                          <p className="text-xs">
                            O estoque é gerenciado apenas pelas movimentações.
                            Use a tela de Estoque para adicionar entradas.
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="edit-daily-consumption">
                          Consumo Diário *
                        </Label>
                        <Input
                          id="edit-daily-consumption"
                          type="number"
                          step="0.01"
                          value={newMedication.dailyConsumption}
                          onChange={(e) =>
                            setNewMedication({
                              ...newMedication,
                              dailyConsumption: e.target.value,
                            })
                          }
                          placeholder="Ex: 2"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        id="edit-hasTapering"
                        checked={newMedication.hasTapering}
                        onCheckedChange={(checked) =>
                          setNewMedication({
                            ...newMedication,
                            hasTapering: checked as boolean,
                          })
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="edit-hasTapering"
                          className="cursor-pointer text-sm"
                        >
                          Este medicamento tem desmame (tapering)
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 4: Observações */}
              {editStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Observações
                    </h3>
                    <p className="text-sm text-gray-500">
                      Instruções adicionais (opcional)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="edit-instructions">
                      Instruções e Observações
                    </Label>
                    <Textarea
                      id="edit-instructions"
                      value={newMedication.instructions}
                      onChange={(e) =>
                        setNewMedication({
                          ...newMedication,
                          instructions: e.target.value,
                        })
                      }
                      placeholder="Ex: Tomar com alimentos, evitar leite..."
                      rows={6}
                      className="mt-1 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="border-t pt-4">
              <div className="flex justify-between w-full">
                <Button
                  variant="outline"
                  onClick={() =>
                    editStep === 1
                      ? setIsEditDialogOpen(false)
                      : setEditStep(editStep - 1)
                  }
                >
                  {editStep === 1 ? "Cancelar" : "Voltar"}
                </Button>
                <div className="flex gap-2">
                  {editStep < 4 && (
                    <Button
                      onClick={() => setEditStep(editStep + 1)}
                      className="bg-[#16808c] hover:bg-[#16808c]/90"
                    >
                      Próximo
                    </Button>
                  )}
                  {editStep === 4 && (
                    <Button
                      className="bg-[#16808c] hover:bg-[#16808c]/90"
                      onClick={handleSaveEdit}
                    >
                      Salvar Alterações
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O medicamento será removido
                permanentemente do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMedication}
                className="bg-[#a61f43] hover:bg-[#a61f43]/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar medicamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Pacientes</SelectItem>
            {patients.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#16808c]">
                {stats.total}
              </div>
              <div className="text-xs text-gray-600 mt-1">Total</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#a0bf80]">
                {stats.normal}
              </div>
              <div className="text-xs text-gray-600 mt-1">Normal</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#f2c36b]">
                {stats.warning}
              </div>
              <div className="text-xs text-gray-600 mt-1">Atenção</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#a61f43]">
                {stats.critical}
              </div>
              <div className="text-xs text-gray-600 mt-1">Crítico</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#6cced9]">
                {stats.temporary}
              </div>
              <div className="text-xs text-gray-600 mt-1">Temporários</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#16808c]">
                {stats.withTapering}
              </div>
              <div className="text-xs text-gray-600 mt-1">Com Desmame</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medications List */}
      <div className="grid gap-4">
        {filteredMedications.map((med) => (
          <Card key={med.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-[#6cced9]/20 flex items-center justify-center flex-shrink-0">
                      <Pill className="h-6 w-6 text-[#16808c]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-bold text-[#16808c]">
                          {med.name} {med.dosage}
                          {getUnitLabel(med.unit)}
                        </h3>
                        {med.hasTapering && (
                          <Badge variant="outline" className="gap-1">
                            {getTaperingIcon(med.currentTaperingPhase)}
                            Desmame
                          </Badge>
                        )}
                        {med.treatmentType === "temporario" && (
                          <Badge variant="outline" className="bg-[#6cced9]/10">
                            Temporário
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600">{med.patient}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(med.status)}>
                      {getStatusText(med.status)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(med)}
                      title="Editar Medicamento"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(med.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Excluir Medicamento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Via</div>
                    <div className="font-medium text-sm">{med.route}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Frequência</div>
                    <div className="font-medium text-sm">{med.frequency}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Horários</div>
                    <div className="font-medium text-sm">
                      {med.times.join(", ")}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Tratamento</div>
                    <div className="font-medium text-sm">
                      {med.treatmentType === "continuo"
                        ? "Contínuo"
                        : "Temporário"}
                    </div>
                  </div>
                </div>

                {/* Treatment Timeline for Temporary */}
                {med.treatmentType === "temporario" && med.treatmentEndDate && (
                  <div className="p-3 bg-[#6cced9]/10 rounded-lg flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-[#16808c]" />
                    <div className="flex-1 text-sm">
                      <span className="font-medium">Início:</span>{" "}
                      {new Date(med.treatmentStartDate).toLocaleDateString(
                        "pt-BR"
                      )}
                      <ArrowRight className="inline h-3 w-3 mx-2" />
                      <span className="font-medium">Término:</span>{" "}
                      {new Date(med.treatmentEndDate).toLocaleDateString(
                        "pt-BR"
                      )}
                    </div>
                  </div>
                )}

                {/* Tapering Info */}
                {med.hasTapering && med.currentTaperingPhase && (
                  <div className="p-3 bg-[#f2c36b]/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getTaperingIcon(med.currentTaperingPhase)}
                      <span className="font-medium text-sm">
                        Fase Atual:{" "}
                        {med.currentTaperingPhase === "aumento"
                          ? "Aumento Gradual"
                          : med.currentTaperingPhase === "reducao"
                          ? "Redução Gradual"
                          : "Manutenção"}
                      </span>
                    </div>
                    {med.taperingSchedule &&
                      med.taperingSchedule.length > 0 && (
                        <div className="text-sm text-gray-600">
                          {med.taperingSchedule.map((schedule, idx) => (
                            <div key={idx} className="mt-1">
                              • {schedule.phase}: {schedule.dosage}
                              {getUnitLabel(med.unit)} - {schedule.instructions}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                )}

                {/* Stock Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Estoque Atual</div>
                      <div className="font-medium">
                        {med.currentStock}{" "}
                        {getUnitLabel(med.presentationForm || med.unit)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">
                        Dias Restantes
                      </div>
                      <div className="font-medium">{med.daysLeft} dias</div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                {med.instructions && (
                  <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Instruções:</span>{" "}
                    {med.instructions}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMedications.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum medicamento encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
