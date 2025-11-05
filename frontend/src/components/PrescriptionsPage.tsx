import { useState, useMemo, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Plus, 
  Search, 
  FileText,
  Upload,
  Image,
  File,
  Calendar,
  Clock,
  User,
  AlertCircle,
  Eye,
  Download,
  Pill,
  X,
  Trash2,
  Info,
  ArrowRight
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";
import { useData, TaperingSchedule, TaperingPhase, DosageUnit, PresentationForm } from "./DataContext";
import { apiFetch, setToken } from "../lib/api";

interface Prescription {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  type: string; // "Simple", "TypeB", "TypeC1", "TypeC2"
  issueDate: string; // "yyyy-MM-dd"
  expiryDate: string; // "yyyy-MM-dd"
  isReusable: boolean;
  isExpired: boolean;
  doctorName?: string;
  doctorCrm?: string;
  notes?: string;
  patientId: string;
  patientName: string;
  ownerId: string;
  uploadedAt: string; // ISO string
  medicationsCount: number;
}

export function PrescriptionsPage() {
  const { patients, medications } = useData(); // Adicionar medications
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [selectedPrescriptionForProcess, setSelectedPrescriptionForProcess] = useState<Prescription | null>(null);
  const [medicationsFromPrescription, setMedicationsFromPrescription] = useState<any[]>([]);
  const [selectedExistingMedications, setSelectedExistingMedications] = useState<string[]>([]); // IDs de medicações existentes selecionadas
  const [medicationStep, setMedicationStep] = useState<Record<number, number>>({}); // Etapas para cada medicação (por índice)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null);
  const [newPrescription, setNewPrescription] = useState({
    patientId: "",
    type: "0", // Simple = 0
    issueDate: new Date().toISOString().split('T')[0], // Hoje
    doctorName: "",
    doctorCrm: "",
    notes: ""
  });

  // Carregar receitas
  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const data = await apiFetch<Prescription[]>(`/prescriptions`);
      setPrescriptions(data || []);
    } catch (e) {
      console.error('Erro ao carregar receitas', e);
    }
  };

  // Filtrar receitas
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(prescription => {
      const matchesSearch = 
        prescription.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prescription.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesPatient = selectedPatient === "all" || prescription.patientId === selectedPatient;
      return matchesSearch && matchesPatient;
    });
  }, [prescriptions, searchTerm, selectedPatient]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = prescriptions.length;
    const expired = prescriptions.filter(p => p.isExpired).length;
    const expiringSoon = prescriptions.filter(p => {
      if (p.isExpired) return false;
      const expiryDate = new Date(p.expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length;
    const simple = prescriptions.filter(p => p.type === "Simple").length;
    const controlled = prescriptions.filter(p => ["TypeB", "TypeC1", "TypeC2"].includes(p.type)).length;

    return { total, expired, expiringSoon, simple, controlled };
  }, [prescriptions]);

  // Mapear tipo para string
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "Simple": return "Simples";
      case "TypeB": return "Tipo B";
      case "TypeC1": return "Tipo C1";
      case "TypeC2": return "Tipo C2";
      default: return type;
    }
  };

  // Mapear tipo para cor
  const getTypeColor = (type: string) => {
    switch (type) {
      case "Simple": return "bg-green-500";
      case "TypeB": return "bg-blue-500";
      case "TypeC1": return "bg-orange-500";
      case "TypeC2": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  // Função para obter o label da unidade
  const getUnitLabel = (unit: string): string => {
    const labels: Record<string, string> = {
      comprimido: "comp",
      ml: "ml",
      gotas: "gts",
      mg: "mg",
      g: "g",
      aplicacao: "apl",
      inalacao: "inal"
    };
    return labels[unit] || unit;
  };

  // Seleção do arquivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Apenas arquivos de imagem (JPG, PNG) ou PDF são permitidos.");
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 10MB.");
      return;
    }

    setSelectedFile(file);
    
    // O backend irá detectar automaticamente o tipo durante o upload
    // Não precisamos fazer detecção no frontend baseado no nome do arquivo
  };

  // Upload da receita
  const handleUpload = async () => {
    if (!selectedFile || !newPrescription.patientId) {
      toast.error("Selecione um arquivo e um paciente.");
      return;
    }

    if (isUploading) {
      return; // Prevenir múltiplos cliques
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('patientId', newPrescription.patientId);
      formData.append('type', newPrescription.type);
      formData.append('issueDate', newPrescription.issueDate);
      if (newPrescription.doctorName) {
        formData.append('doctorName', newPrescription.doctorName);
      }
      if (newPrescription.doctorCrm) {
        formData.append('doctorCrm', newPrescription.doctorCrm);
      }
      if (newPrescription.notes) {
        formData.append('notes', newPrescription.notes);
      }

      // Usar fetch diretamente para FormData
      const token = localStorage.getItem('deja_token');
      const response = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer upload da receita');
      }

      const result = await response.json();
      
      // Se o backend detectou o tipo automaticamente, informar ao usuário
      if (result.detectedType) {
        const typeNames: Record<string, string> = {
          "Simple": "Simples",
          "TypeB": "Tipo B",
          "TypeC1": "Tipo C1",
          "TypeC2": "Tipo C2"
        };
        toast.success(`Receita enviada com sucesso! Tipo detectado automaticamente: ${typeNames[result.detectedType] || result.detectedType}`);
      } else {
        toast.success("Receita enviada com sucesso!");
      }
      // Fechar o dialog apenas se o upload foi bem-sucedido
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setIsUploading(false);
      setNewPrescription({
        patientId: "",
        type: "0",
        issueDate: new Date().toISOString().split('T')[0],
        doctorName: "",
        doctorCrm: "",
        notes: ""
      });
      await loadPrescriptions();
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(error.message || "Erro ao fazer upload da receita.");
    } finally {
      setIsUploading(false);
    }
  };

  // Visualizar arquivo
  const handleViewFile = async (prescription: Prescription) => {
    try {
      const token = localStorage.getItem('deja_token');
      const response = await fetch(`/api/prescriptions/${prescription.id}/file`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar arquivo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erro ao visualizar arquivo:', error);
      toast.error("Erro ao visualizar arquivo.");
    }
  };

  // Verificar se está vencendo
  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  // Deletar receita
  const handleDeletePrescription = async () => {
    if (!prescriptionToDelete) return;

    try {
      await apiFetch(`/prescriptions/${prescriptionToDelete.id}`, {
        method: 'DELETE',
      });
      
      toast.success("Receita excluída com sucesso!");
      setDeleteDialogOpen(false);
      setPrescriptionToDelete(null);
      await loadPrescriptions();
    } catch (error: any) {
      console.error('Erro ao deletar receita:', error);
      toast.error(error.message || "Erro ao excluir a receita.");
    }
  };

  // Abrir dialog de confirmação de exclusão
  const openDeleteDialog = (prescription: Prescription) => {
    setPrescriptionToDelete(prescription);
    setDeleteDialogOpen(true);
  };

  // Abrir dialog de processamento de receita
  const handleOpenProcessDialog = (prescription: Prescription) => {
    setSelectedPrescriptionForProcess(prescription);
    // Inicializar com uma medicação vazia com todos os campos
    setMedicationsFromPrescription([{
      name: "",
      dosage: "",
      dosageUnit: "mg" as DosageUnit,
      presentationForm: "comprimido" as PresentationForm,
      unit: "comprimido", // Mantido para compatibilidade
      route: "Oral",
      frequency: "Diário",
      times: [],
      isHalfDose: false,
      customFrequency: "",
      isExtra: false,
      treatmentType: 0, // 0 = Continuo, 1 = Temporario
      treatmentStartDate: prescription.issueDate || new Date().toISOString().split('T')[0],
      treatmentEndDate: null,
      hasTapering: false,
      taperingSchedule: [] as TaperingSchedule[],
      currentStock: "",
      dailyConsumption: "",
      boxQuantity: "",
      instructions: ""
    }]);
    // Resetar seleção de medicações existentes
    setSelectedExistingMedications([]);
    setMedicationStep({ 0: 1 }); // Iniciar primeira medicação na etapa 1
    setIsProcessDialogOpen(true);
  };

  // Adicionar nova medicação ao processamento
  const handleAddMedicationToProcess = () => {
    const newIndex = medicationsFromPrescription.length;
    setMedicationsFromPrescription([...medicationsFromPrescription, {
      name: "",
      dosage: "",
      dosageUnit: "mg" as DosageUnit,
      presentationForm: "comprimido" as PresentationForm,
      unit: "comprimido", // Mantido para compatibilidade
      route: "Oral",
      frequency: "Diário",
      times: [],
      isHalfDose: false,
      customFrequency: "",
      isExtra: false,
      treatmentType: 0,
      treatmentStartDate: selectedPrescriptionForProcess?.issueDate || new Date().toISOString().split('T')[0],
      treatmentEndDate: null,
      hasTapering: false,
      taperingSchedule: [] as TaperingSchedule[],
      currentStock: "",
      dailyConsumption: "",
      boxQuantity: "",
      instructions: ""
    }]);
    setMedicationStep({ ...medicationStep, [newIndex]: 1 }); // Iniciar nova medicação na etapa 1
  };

  // Remover medicação do processamento
  const handleRemoveMedicationFromProcess = (index: number) => {
    setMedicationsFromPrescription(medicationsFromPrescription.filter((_, i) => i !== index));
    // Remover step da medicação removida e ajustar índices
    const newSteps: Record<number, number> = {};
    medicationsFromPrescription.forEach((_, i) => {
      if (i < index) {
        newSteps[i] = medicationStep[i] || 1;
      } else if (i > index) {
        newSteps[i - 1] = medicationStep[i] || 1;
      }
    });
    setMedicationStep(newSteps);
  };

  // Navegar para próxima etapa de uma medicação específica
  const handleNextMedicationStep = (index: number) => {
    const currentStep = medicationStep[index] || 1;
    if (currentStep < 4) {
      setMedicationStep({ ...medicationStep, [index]: currentStep + 1 });
    }
  };

  // Navegar para etapa anterior de uma medicação específica
  const handlePreviousMedicationStep = (index: number) => {
    const currentStep = medicationStep[index] || 1;
    if (currentStep > 1) {
      setMedicationStep({ ...medicationStep, [index]: currentStep - 1 });
    }
  };

  // Processar receita e criar medicações
  const handleProcessPrescription = async () => {
    if (!selectedPrescriptionForProcess) {
      toast.error("Nenhuma receita selecionada.");
      return;
    }

    // Validar se há pelo menos uma medicação nova ou uma existente selecionada
    const validMedications = medicationsFromPrescription.filter(med => 
      med.name.trim() !== "" && med.dosage !== ""
    );

    if (validMedications.length === 0 && selectedExistingMedications.length === 0) {
      toast.error("Selecione medicações existentes ou adicione novas medicações.");
      return;
    }

    try {
      const token = localStorage.getItem('deja_token');
      const response = await fetch(`/api/prescriptions/${selectedPrescriptionForProcess.id}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prescriptionId: selectedPrescriptionForProcess.id,
          existingMedicationIds: selectedExistingMedications, // IDs de medicações existentes para associar
          medications: validMedications.map(med => ({
            name: med.name,
            dosage: parseFloat(med.dosage) || 0,
            dosageUnit: med.dosageUnit || med.unit,
            presentationForm: med.presentationForm || (med.unit && ["comprimido","capsula","gotas","aplicacao","inalacao","ampola","xarope","suspensao"].includes(med.unit) ? med.unit : "comprimido"),
            unit: med.unit, // compatibilidade
            route: med.route,
            frequency: med.frequency,
            times: med.times || [],
            isHalfDose: med.isHalfDose || false,
            customFrequency: med.customFrequency || null,
            isExtra: med.isExtra || false,
            treatmentType: med.treatmentType,
            treatmentStartDate: med.treatmentStartDate || selectedPrescriptionForProcess?.issueDate || new Date().toISOString().split('T')[0],
            treatmentEndDate: med.treatmentEndDate || null,
            hasTapering: med.hasTapering,
            taperingSchedule: med.hasTapering && med.taperingSchedule && med.taperingSchedule.length > 0 ? med.taperingSchedule.map(phase => ({
              phase: phase.phase,
              startDate: phase.startDate,
              endDate: phase.endDate || null,
              dosage: parseFloat(String(phase.dosage)) || 0,
              frequency: phase.frequency || med.frequency || "Diário",
              instructions: phase.instructions || ""
            })) : [],
            currentStock: parseFloat(String(med.currentStock)) || 0,
            dailyConsumption: parseFloat(String(med.dailyConsumption)) || 0,
            boxQuantity: parseFloat(String(med.boxQuantity)) || 0,
            instructions: med.instructions || ""
          }))
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao processar receita');
      }

      const totalAssociations = selectedExistingMedications.length;
      const totalNew = validMedications.length;
      let message = "";
      if (totalAssociations > 0 && totalNew > 0) {
        message = `${totalNew} medicação(ões) criada(s) e ${totalAssociations} medicação(ões) associada(s) com sucesso!`;
      } else if (totalAssociations > 0) {
        message = `${totalAssociations} medicação(ões) associada(s) com sucesso!`;
      } else {
        message = `${totalNew} medicação(ões) criada(s) com sucesso!`;
      }
      toast.success(message);
      setIsProcessDialogOpen(false);
      setSelectedPrescriptionForProcess(null);
      setMedicationsFromPrescription([]);
      setSelectedExistingMedications([]);
      await loadPrescriptions();
      // Recarregar dados (incluindo medicações) - pode precisar de um reload da página ou atualizar o DataContext
      window.location.reload(); // Temporário - depois podemos melhorar isso
    } catch (error: any) {
      console.error('Erro ao processar receita:', error);
      toast.error(error.message || "Erro ao processar receita.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#16808c]">Receitas Médicas</h1>
          <p className="text-gray-600 mt-1">Gerencie as receitas dos pacientes</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#16808c] hover:bg-[#16808c]/90 text-white">
              <Upload className="h-4 w-4 mr-2" />
              Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#16808c]">Upload de Receita</DialogTitle>
              <DialogDescription>
                Faça upload de uma receita médica (imagem ou PDF)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Seleção de arquivo */}
              <div>
                <Label htmlFor="file">Arquivo *</Label>
                <div className="mt-2">
                  <Input
                    id="file"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                </div>
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    {selectedFile.type.startsWith('image/') ? (
                      <Image className="h-4 w-4" />
                    ) : (
                      <File className="h-4 w-4" />
                    )}
                    <span>{selectedFile.name}</span>
                    <span className="text-gray-400">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Você pode fazer upload de PDFs com múltiplas páginas ou imagens (JPG, PNG).
                </p>
              </div>

              {/* Paciente */}
              <div>
                <Label htmlFor="patient">Paciente *</Label>
                <Select
                  value={newPrescription.patientId}
                  onValueChange={(value) => setNewPrescription({ ...newPrescription, patientId: value })}
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

              {/* Tipo de Receita */}
              <div>
                <Label htmlFor="type">Tipo de Receita *</Label>
                <Select
                  value={newPrescription.type}
                  onValueChange={(value) => setNewPrescription({ ...newPrescription, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Simples</SelectItem>
                    <SelectItem value="1">Tipo B</SelectItem>
                    <SelectItem value="2">Tipo C1</SelectItem>
                    <SelectItem value="3">Tipo C2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data de Emissão */}
              <div>
                <Label htmlFor="issueDate">Data de Emissão *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={newPrescription.issueDate}
                  onChange={(e) => setNewPrescription({ ...newPrescription, issueDate: e.target.value })}
                />
              </div>

              {/* Informações do Médico */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doctorName">Nome do Médico</Label>
                  <Input
                    id="doctorName"
                    value={newPrescription.doctorName}
                    onChange={(e) => setNewPrescription({ ...newPrescription, doctorName: e.target.value })}
                    placeholder="Ex: Dr. João Silva"
                  />
                </div>
                <div>
                  <Label htmlFor="doctorCrm">CRM</Label>
                  <Input
                    id="doctorCrm"
                    value={newPrescription.doctorCrm}
                    onChange={(e) => setNewPrescription({ ...newPrescription, doctorCrm: e.target.value })}
                    placeholder="Ex: 12345"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={newPrescription.notes}
                  onChange={(e) => setNewPrescription({ ...newPrescription, notes: e.target.value })}
                  placeholder="Observações adicionais sobre a receita..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsUploadDialogOpen(false)}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleUpload} 
                className="bg-[#16808c] hover:bg-[#16808c]/90"
                disabled={isUploading || !selectedFile || !newPrescription.patientId}
              >
                {isUploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Receita
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-[#16808c]">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-[#16808c]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold text-[#a61f43]">{stats.expired}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-[#a61f43]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vencendo</p>
                <p className="text-2xl font-bold text-[#f2c36b]">{stats.expiringSoon}</p>
              </div>
              <Clock className="h-8 w-8 text-[#f2c36b]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Simples</p>
                <p className="text-2xl font-bold text-green-600">{stats.simple}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Controladas</p>
                <p className="text-2xl font-bold text-orange-600">{stats.controlled}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por paciente, médico ou arquivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por paciente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os pacientes</SelectItem>
            {patients.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Receitas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrescriptions.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {searchTerm || selectedPatient !== "all" 
              ? "Nenhuma receita encontrada com os filtros aplicados."
              : "Nenhuma receita cadastrada. Clique em 'Nova Receita' para adicionar."}
          </div>
        ) : (
          filteredPrescriptions.map(prescription => (
            <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{prescription.patientName}</CardTitle>
                    <CardDescription className="mt-1">
                      {prescription.fileName}
                    </CardDescription>
                  </div>
                  <Badge className={getTypeColor(prescription.type)}>
                    {getTypeLabel(prescription.type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Informações da Receita */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Emissão: {new Date(prescription.issueDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      Válida até: {new Date(prescription.expiryDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {prescription.doctorName && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>
                        {prescription.doctorName}
                        {prescription.doctorCrm && ` - CRM: ${prescription.doctorCrm}`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Pill className="h-4 w-4" />
                    <span>{prescription.medicationsCount} medicação(ões)</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex gap-2">
                  {prescription.isExpired && (
                    <Badge variant="destructive">Vencida</Badge>
                  )}
                  {!prescription.isExpired && isExpiringSoon(prescription.expiryDate) && (
                    <Badge variant="outline" className="border-[#f2c36b] text-[#f2c36b]">
                      Vencendo em breve
                    </Badge>
                  )}
                  {prescription.isReusable && !prescription.isExpired && (
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      Reutilizável
                    </Badge>
                  )}
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewFile(prescription)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const token = localStorage.getItem('deja_token');
                      window.open(`/api/prescriptions/${prescription.id}/file`, '_blank');
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                    onClick={() => handleOpenProcessDialog(prescription)}
                    title="Processar Receita"
                  >
                    <Pill className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-50 hover:bg-red-100 border-red-300 text-red-700"
                    onClick={() => openDeleteDialog(prescription)}
                    title="Excluir Receita"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Processamento de Receita */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#16808c]">Associar/Criar Medicações da Receita</DialogTitle>
            <DialogDescription>
              Selecione medicações existentes ou adicione novas medicações para a receita de {selectedPrescriptionForProcess?.patientName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Seção: Medicações Existentes do Paciente */}
            {selectedPrescriptionForProcess && (
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">Medicações Existentes do Paciente</Label>
                  <Badge variant="outline" className="bg-white">
                    {medications.filter(m => m.patientId === selectedPrescriptionForProcess.patientId).length} disponível(is)
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Selecione medicações já cadastradas para associar a esta receita:
                </p>
                {medications.filter(m => m.patientId === selectedPrescriptionForProcess.patientId).length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Nenhuma medicação cadastrada para este paciente.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {medications
                      .filter(m => m.patientId === selectedPrescriptionForProcess.patientId)
                      .map(med => (
                        <div
                          key={med.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedExistingMedications.includes(med.id)
                              ? 'bg-[#16808c] text-white border-[#16808c]'
                              : 'bg-white hover:bg-gray-50 border-gray-200'
                          }`}
                          onClick={() => {
                            if (selectedExistingMedications.includes(med.id)) {
                              setSelectedExistingMedications(selectedExistingMedications.filter(id => id !== med.id));
                            } else {
                              setSelectedExistingMedications([...selectedExistingMedications, med.id]);
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedExistingMedications.includes(med.id)}
                            onChange={() => {}}
                            className="rounded border-gray-300 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{med.name}</div>
                            <div className="text-xs opacity-80">
                              {med.dosage} {med.unit} • {med.route} • {med.frequency}
                            </div>
                          </div>
                          {med.prescriptionId && (
                            <Badge variant="outline" className="bg-white text-xs">
                              Já associada
                            </Badge>
                          )}
                        </div>
                      ))}
                  </div>
                )}
                {selectedExistingMedications.length > 0 && (
                  <p className="text-xs text-[#16808c] font-medium mt-3">
                    {selectedExistingMedications.length} medicação(ões) selecionada(s)
                  </p>
                )}
              </div>
            )}

            {/* Separador */}
            <div className="flex items-center gap-4">
              <div className="flex-1 border-t"></div>
              <span className="text-sm text-gray-500 font-medium">OU</span>
              <div className="flex-1 border-t"></div>
            </div>

            {/* Seção: Criar Novas Medicações */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Criar Novas Medicações</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMedicationToProcess}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Medicação
                </Button>
              </div>
              
              <div className="space-y-4">
            {medicationsFromPrescription.map((med, index) => {
              const currentStep = medicationStep[index] || 1;
              return (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <h3 className="font-semibold text-lg">Medicação {index + 1}</h3>
                  {medicationsFromPrescription.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMedicationFromProcess(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Indicador de etapas */}
                <div className="flex items-center justify-between mb-6">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        currentStep === step 
                          ? 'bg-[#16808c] border-[#16808c] text-white' 
                          : currentStep > step
                          ? 'bg-[#16808c] border-[#16808c] text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                        {currentStep > step ? <ArrowRight className="h-4 w-4" /> : step}
                      </div>
                      {step < 4 && (
                        <div className={`flex-1 h-0.5 mx-2 ${
                          currentStep > step ? 'bg-[#16808c]' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Conteúdo das etapas */}
                <div className="space-y-6">
                  {/* Etapa 1: Informações Básicas */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Informações Básicas</h3>
                        <p className="text-sm text-gray-500">Nome, paciente e dosagem</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`med-name-${index}`}>Nome do Medicamento *</Label>
                          <Input
                            id={`med-name-${index}`}
                            value={med.name}
                            onChange={(e) => {
                              const updated = [...medicationsFromPrescription];
                              updated[index].name = e.target.value;
                              setMedicationsFromPrescription(updated);
                            }}
                            placeholder="Ex: Losartana"
                          />
                        </div>
                        
                        <div>
                          <Label>Dosagem por Unidade (Comprimido/Pílula/Medida) *</Label>
                          <p className="text-xs text-gray-500 mb-2">Ex: Mirtazapina 15mg por comprimido, Losartana 50mg por comprimido</p>
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <div>
                              <Label htmlFor={`med-dosage-${index}`} className="text-xs text-gray-600">Quantidade por unidade</Label>
                              <Input
                                id={`med-dosage-${index}`}
                                type="number"
                                step="0.01"
                                value={med.dosage}
                                onChange={(e) => {
                                  const updated = [...medicationsFromPrescription];
                                  updated[index].dosage = e.target.value;
                                  setMedicationsFromPrescription(updated);
                                }}
                                placeholder="Ex: 15"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`med-dosage-unit-${index}`} className="text-xs text-gray-600">Unidade de medida</Label>
                              <Select
                                value={med.dosageUnit || "mg"}
                                onValueChange={(value) => {
                                  const updated = [...medicationsFromPrescription];
                                  updated[index].dosageUnit = value;
                                  updated[index].unit = value;
                                  setMedicationsFromPrescription(updated);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mg">Miligramas (mg)</SelectItem>
                                  <SelectItem value="g">Gramas (g)</SelectItem>
                                  <SelectItem value="ml">Mililitros (ml)</SelectItem>
                                  <SelectItem value="mcg">Microgramas (mcg)</SelectItem>
                                  <SelectItem value="ui">Unidades Internacionais (UI)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Label htmlFor={`med-presentation-${index}`} className="text-xs text-gray-600">Forma de Apresentação</Label>
                            <Select
                              value={med.presentationForm || "comprimido"}
                              onValueChange={(value) => {
                                const updated = [...medicationsFromPrescription];
                                updated[index].presentationForm = value;
                                setMedicationsFromPrescription(updated);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
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
                          {med.dosage && med.dosageUnit && med.presentationForm && (
                            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              <span className="font-medium">Dosagem por unidade:</span> {med.dosage} {med.dosageUnit} por {med.presentationForm === "comprimido" ? "comprimido" : med.presentationForm === "capsula" ? "cápsula" : med.presentationForm}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Etapa 2: Administração */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Administração</h3>
                        <p className="text-sm text-gray-500">Via, frequência e horários</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`med-route-${index}`}>Via de Administração</Label>
                          <Select
                            value={med.route}
                            onValueChange={(value) => {
                              const updated = [...medicationsFromPrescription];
                              updated[index].route = value;
                              setMedicationsFromPrescription(updated);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                          <Label htmlFor={`med-frequency-${index}`}>Frequência</Label>
                          <Select
                            value={med.frequency}
                            onValueChange={(value) => {
                              const updated = [...medicationsFromPrescription];
                              updated[index].frequency = value;
                              setMedicationsFromPrescription(updated);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                          <Label>Horários de Administração (Posologia) *</Label>
                          <div className="space-y-2 mt-2">
                            {(med.times || []).map((time, timeIdx) => (
                              <div key={timeIdx} className="flex gap-2">
                                <Input
                                  type="time"
                                  value={time}
                                  onChange={(e) => {
                                    const updated = [...medicationsFromPrescription];
                                    if (!updated[index].times) updated[index].times = [];
                                    updated[index].times[timeIdx] = e.target.value;
                                    setMedicationsFromPrescription(updated);
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updated = [...medicationsFromPrescription];
                                    updated[index].times = (updated[index].times || []).filter((_, i) => i !== timeIdx);
                                    setMedicationsFromPrescription(updated);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                const updated = [...medicationsFromPrescription];
                                if (!updated[index].times) updated[index].times = [];
                                updated[index].times.push("");
                                setMedicationsFromPrescription(updated);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar horário
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2 border-t">
                          <Checkbox
                            id={`med-isHalfDose-${index}`}
                            checked={med.isHalfDose || false}
                            onCheckedChange={(checked) => {
                              const updated = [...medicationsFromPrescription];
                              updated[index].isHalfDose = checked === true;
                              setMedicationsFromPrescription(updated);
                            }}
                          />
                          <Label htmlFor={`med-isHalfDose-${index}`} className="text-sm font-normal cursor-pointer">
                            Meia dose (1/2 comprimido por administração)
                          </Label>
                          <p className="text-xs text-gray-500 ml-6">Marque se cada administração usa apenas 1/2 comprimido ao invés de 1 inteiro</p>
                        </div>

                        {med.frequency === "Intervalar" && (
                          <div>
                            <Label htmlFor={`med-customFrequency-${index}`}>Frequência Personalizada</Label>
                            <Input
                              id={`med-customFrequency-${index}`}
                              value={med.customFrequency || ""}
                              onChange={(e) => {
                                const updated = [...medicationsFromPrescription];
                                updated[index].customFrequency = e.target.value;
                                setMedicationsFromPrescription(updated);
                              }}
                              placeholder="Ex: a cada 2 dias"
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">Informe a frequência personalizada (ex: "a cada 2 dias", "3x por semana")</p>
                          </div>
                        )}

                        <div className="flex items-center space-x-2 pt-2 border-t">
                          <Checkbox
                            id={`med-isExtra-${index}`}
                            checked={med.isExtra || false}
                            onCheckedChange={(checked) => {
                              const updated = [...medicationsFromPrescription];
                              updated[index].isExtra = checked === true;
                              setMedicationsFromPrescription(updated);
                            }}
                          />
                          <Label htmlFor={`med-isExtra-${index}`} className="text-sm font-normal cursor-pointer">
                            Medicação extra/avulsa
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Etapa 3: Tratamento e Estoque */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Tratamento e Estoque</h3>
                        <p className="text-sm text-gray-500">Tipo de tratamento e informações de estoque</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`med-treatment-type-${index}`}>Tipo de Tratamento</Label>
                          <Select
                            value={String(med.treatmentType)}
                            onValueChange={(value) => {
                              const updated = [...medicationsFromPrescription];
                              updated[index].treatmentType = parseInt(value);
                              setMedicationsFromPrescription(updated);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Contínuo (uso permanente)</SelectItem>
                              <SelectItem value="1">Temporário (início e fim)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`med-start-date-${index}`}>Data de Início</Label>
                            <Input
                              id={`med-start-date-${index}`}
                              type="date"
                              value={med.treatmentStartDate}
                              onChange={(e) => {
                                const updated = [...medicationsFromPrescription];
                                updated[index].treatmentStartDate = e.target.value;
                                setMedicationsFromPrescription(updated);
                              }}
                            />
                          </div>
                          {med.treatmentType === 1 && (
                            <div>
                              <Label htmlFor={`med-end-date-${index}`}>Data de Término (Prevista)</Label>
                              <Input
                                id={`med-end-date-${index}`}
                                type="date"
                                value={med.treatmentEndDate || ""}
                                onChange={(e) => {
                                  const updated = [...medicationsFromPrescription];
                                  updated[index].treatmentEndDate = e.target.value || null;
                                  setMedicationsFromPrescription(updated);
                                }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg">
                          <Checkbox
                            id={`med-tapering-${index}`}
                            checked={med.hasTapering}
                            onCheckedChange={(checked) => {
                              const updated = [...medicationsFromPrescription];
                              updated[index].hasTapering = checked as boolean;
                              if (!checked) {
                                updated[index].taperingSchedule = [];
                              } else if (!updated[index].taperingSchedule || updated[index].taperingSchedule.length === 0) {
                                updated[index].taperingSchedule = [{
                                  phase: "aumento" as TaperingPhase,
                                  startDate: med.treatmentStartDate || selectedPrescriptionForProcess?.issueDate || new Date().toISOString().split('T')[0],
                                  endDate: "",
                                  dosage: parseFloat(med.dosage) || 0,
                                  frequency: med.frequency || "Diário",
                                  instructions: ""
                                }];
                              }
                              setMedicationsFromPrescription(updated);
                            }}
                          />
                          <div className="flex-1">
                            <Label htmlFor={`med-tapering-${index}`} className="cursor-pointer flex items-center gap-2">
                              Este medicamento tem desmame (tapering)
                              <Info className="h-4 w-4 text-gray-400" />
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">
                              Marque se a dose aumenta ou diminui gradualmente durante o tratamento
                            </p>
                          </div>
                        </div>

                        {med.hasTapering && (
                          <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-4">
                              <Label className="text-base font-semibold">Esquema de Desmame (Tapering)</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updated = [...medicationsFromPrescription];
                                  if (!updated[index].taperingSchedule) updated[index].taperingSchedule = [];
                                  updated[index].taperingSchedule.push({
                                    phase: "manutencao" as TaperingPhase,
                                    startDate: med.treatmentStartDate || selectedPrescriptionForProcess?.issueDate || new Date().toISOString().split('T')[0],
                                    endDate: "",
                                    dosage: parseFloat(med.dosage) || 0,
                                    frequency: med.frequency || "Diário",
                                    instructions: ""
                                  });
                                  setMedicationsFromPrescription(updated);
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Fase
                              </Button>
                            </div>
                            
                            <div className="space-y-4">
                              {(med.taperingSchedule || []).map((phase, phaseIdx) => (
                                <Card key={phaseIdx} className="p-4 bg-white">
                                  <div className="flex items-center justify-between mb-3">
                                    <Label className="text-sm font-medium">Fase {phaseIdx + 1}</Label>
                                    {(med.taperingSchedule?.length || 0) > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const updated = [...medicationsFromPrescription];
                                          updated[index].taperingSchedule = (updated[index].taperingSchedule || []).filter((_, i) => i !== phaseIdx);
                                          setMedicationsFromPrescription(updated);
                                        }}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor={`taper-phase-${index}-${phaseIdx}`}>Tipo de Fase</Label>
                                      <Select
                                        value={phase.phase}
                                        onValueChange={(value) => {
                                          const updated = [...medicationsFromPrescription];
                                          if (!updated[index].taperingSchedule) updated[index].taperingSchedule = [];
                                          updated[index].taperingSchedule[phaseIdx].phase = value as TaperingPhase;
                                          setMedicationsFromPrescription(updated);
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="aumento">Aumento Gradual</SelectItem>
                                          <SelectItem value="manutencao">Manutenção</SelectItem>
                                          <SelectItem value="reducao">Redução Gradual</SelectItem>
                                          <SelectItem value="finalizado">Finalizado</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor={`taper-dosage-${index}-${phaseIdx}`}>Dosagem desta Fase</Label>
                                      <Input
                                        id={`taper-dosage-${index}-${phaseIdx}`}
                                        type="number"
                                        step="0.01"
                                        value={phase.dosage}
                                        onChange={(e) => {
                                          const updated = [...medicationsFromPrescription];
                                          if (!updated[index].taperingSchedule) updated[index].taperingSchedule = [];
                                          updated[index].taperingSchedule[phaseIdx].dosage = parseFloat(e.target.value) || 0;
                                          setMedicationsFromPrescription(updated);
                                        }}
                                        placeholder="Ex: 25"
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor={`taper-start-${index}-${phaseIdx}`}>Data de Início</Label>
                                      <Input
                                        id={`taper-start-${index}-${phaseIdx}`}
                                        type="date"
                                        value={phase.startDate}
                                        onChange={(e) => {
                                          const updated = [...medicationsFromPrescription];
                                          if (!updated[index].taperingSchedule) updated[index].taperingSchedule = [];
                                          updated[index].taperingSchedule[phaseIdx].startDate = e.target.value;
                                          setMedicationsFromPrescription(updated);
                                        }}
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor={`taper-end-${index}-${phaseIdx}`}>Data de Término (opcional)</Label>
                                      <Input
                                        id={`taper-end-${index}-${phaseIdx}`}
                                        type="date"
                                        value={phase.endDate || ""}
                                        onChange={(e) => {
                                          const updated = [...medicationsFromPrescription];
                                          if (!updated[index].taperingSchedule) updated[index].taperingSchedule = [];
                                          updated[index].taperingSchedule[phaseIdx].endDate = e.target.value || undefined;
                                          setMedicationsFromPrescription(updated);
                                        }}
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor={`taper-frequency-${index}-${phaseIdx}`}>Frequência</Label>
                                      <Select
                                        value={phase.frequency}
                                        onValueChange={(value) => {
                                          const updated = [...medicationsFromPrescription];
                                          if (!updated[index].taperingSchedule) updated[index].taperingSchedule = [];
                                          updated[index].taperingSchedule[phaseIdx].frequency = value;
                                          setMedicationsFromPrescription(updated);
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Diário">Diário</SelectItem>
                                          <SelectItem value="Semanal">Semanal</SelectItem>
                                          <SelectItem value="Mensal">Mensal</SelectItem>
                                          <SelectItem value="Intervalar">Intervalar</SelectItem>
                                          <SelectItem value="Variável">Variável</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-4">
                                    <Label htmlFor={`taper-instructions-${index}-${phaseIdx}`}>Instruções da Fase</Label>
                                    <Textarea
                                      id={`taper-instructions-${index}-${phaseIdx}`}
                                      value={phase.instructions || ""}
                                      onChange={(e) => {
                                        const updated = [...medicationsFromPrescription];
                                        if (!updated[index].taperingSchedule) updated[index].taperingSchedule = [];
                                        updated[index].taperingSchedule[phaseIdx].instructions = e.target.value;
                                        setMedicationsFromPrescription(updated);
                                      }}
                                      placeholder="Instruções específicas para esta fase (ex: Tomar com alimentos, monitorar sinais vitais...)"
                                      rows={2}
                                    />
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`med-box-quantity-${index}`}>Qtd. por Embalagem</Label>
                            <Input
                              id={`med-box-quantity-${index}`}
                              type="number"
                              step="0.01"
                              value={med.boxQuantity}
                              onChange={(e) => {
                                const updated = [...medicationsFromPrescription];
                                updated[index].boxQuantity = e.target.value;
                                setMedicationsFromPrescription(updated);
                              }}
                              placeholder="Ex: 30"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`med-stock-${index}`}>Estoque Inicial</Label>
                            <p className="text-xs text-gray-500 mb-1">Este valor será registrado como movimentação de entrada</p>
                            <Input
                              id={`med-stock-${index}`}
                              type="number"
                              step="0.01"
                              value={med.currentStock}
                              onChange={(e) => {
                                const updated = [...medicationsFromPrescription];
                                updated[index].currentStock = e.target.value;
                                setMedicationsFromPrescription(updated);
                              }}
                              placeholder="Ex: 60"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`med-daily-consumption-${index}`}>Consumo Diário (quantidade de unidades por dia)</Label>
                            <p className="text-xs text-gray-500 mb-1">Ex: 2 comprimidos (1 manhã + 1 noite), 3 gotas, etc.</p>
                            <Input
                              id={`med-daily-consumption-${index}`}
                              type="number"
                              step="0.01"
                              value={med.dailyConsumption}
                              onChange={(e) => {
                                const updated = [...medicationsFromPrescription];
                                updated[index].dailyConsumption = e.target.value;
                                setMedicationsFromPrescription(updated);
                              }}
                              placeholder="Ex: 2"
                            />
                            {med.dosage && med.dosageUnit && med.dailyConsumption && (
                              <p className="text-xs text-gray-600 mt-1">
                                Total: {parseFloat(String(med.dailyConsumption)) * parseFloat(String(med.dosage))} {med.dosageUnit} por dia
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Etapa 4: Observações */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Observações</h3>
                        <p className="text-sm text-gray-500">Instruções adicionais (opcional)</p>
                      </div>

                      <div>
                        <Label htmlFor={`med-instructions-${index}`}>Instruções e Observações</Label>
                        <Textarea
                          id={`med-instructions-${index}`}
                          value={med.instructions || ""}
                          onChange={(e) => {
                            const updated = [...medicationsFromPrescription];
                            updated[index].instructions = e.target.value;
                            setMedicationsFromPrescription(updated);
                          }}
                          placeholder="Instruções adicionais sobre a administração do medicamento..."
                          rows={6}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Botões de navegação */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handlePreviousMedicationStep(index)}
                    disabled={currentStep === 1}
                  >
                    {currentStep === 1 ? 'Cancelar' : 'Voltar'}
                  </Button>
                  <div className="flex gap-2">
                    {currentStep < 4 && (
                      <Button 
                        onClick={() => handleNextMedicationStep(index)}
                        className="bg-[#16808c] hover:bg-[#16808c]/90"
                      >
                        Próximo
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )})}
            
            <Button
              variant="outline"
              onClick={handleAddMedicationToProcess}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Outra Medicação
            </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleProcessPrescription} 
              className="bg-[#16808c] hover:bg-[#16808c]/90"
            >
              <Pill className="h-4 w-4 mr-2" />
              Criar Medicações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A receita e seu arquivo serão removidos permanentemente.
              {prescriptionToDelete && prescriptionToDelete.medicationsCount > 0 && (
                <span className="block mt-2 text-orange-600 font-medium">
                  Atenção: {prescriptionToDelete.medicationsCount} medicação(ões) associada(s) a esta receita terá(ão) a associação removida, mas não serão deletadas.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePrescription}
              className="bg-[#a61f43] hover:bg-[#a61f43]/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

