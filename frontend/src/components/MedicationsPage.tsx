import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
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
  Info
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
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner@2.0.3";
import { useData, MedicationUnit, TreatmentType, TaperingSchedule } from "./DataContext";

export function MedicationsPage() {
  const { medications, patients, addMedication } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("all");
  
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    unit: "comprimido" as MedicationUnit,
    patient: "",
    patientId: "",
    administrationRoute: "",
    frequency: "",
    times: "",
    prescriptionType: "",
    treatmentType: "continuo" as TreatmentType,
    treatmentStartDate: "",
    treatmentEndDate: "",
    hasTapering: false,
    taperingSchedule: [] as TaperingSchedule[],
    boxQuantity: "",
    currentStock: "",
    dailyConsumption: "",
    instructions: ""
  });

  // Memoized filtered medications para performance
  const filteredMedications = useMemo(() => {
    return medications.filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           med.patient.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPatient = selectedPatient === "all" || med.patientId === selectedPatient;
      return matchesSearch && matchesPatient;
    });
  }, [medications, searchTerm, selectedPatient]);

  // Memoized stats para performance
  const stats = useMemo(() => {
    const total = medications.length;
    const normal = medications.filter(m => m.status === "ok").length;
    const warning = medications.filter(m => m.status === "warning").length;
    const critical = medications.filter(m => m.status === "critical").length;
    const temporary = medications.filter(m => m.treatmentType === "temporario").length;
    const withTapering = medications.filter(m => m.hasTapering).length;

    return { total, normal, warning, critical, temporary, withTapering };
  }, [medications]);

  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.patientId) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const patientData = patients.find(p => p.id === newMedication.patientId);
    if (!patientData) return;

    const dailyConsumption = parseFloat(newMedication.dailyConsumption) || 0;
    const currentStock = parseFloat(newMedication.currentStock) || 0;
    const daysLeft = dailyConsumption > 0 ? Math.floor(currentStock / dailyConsumption) : 0;

    addMedication({
      name: newMedication.name,
      dosage: parseFloat(newMedication.dosage) || 0,
      unit: newMedication.unit,
      patient: patientData.name,
      patientId: newMedication.patientId,
      route: newMedication.administrationRoute,
      frequency: newMedication.frequency,
      times: newMedication.times.split(",").map(t => t.trim()).filter(t => t),
      prescriptionType: newMedication.prescriptionType,
      prescriptionExpiry: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      treatmentType: newMedication.treatmentType,
      treatmentStartDate: newMedication.treatmentStartDate,
      treatmentEndDate: newMedication.treatmentEndDate,
      hasTapering: newMedication.hasTapering,
      taperingSchedule: newMedication.taperingSchedule,
      currentTaperingPhase: newMedication.hasTapering && newMedication.taperingSchedule.length > 0 
        ? newMedication.taperingSchedule[0].phase 
        : undefined,
      currentStock,
      dailyConsumption,
      daysLeft,
      boxQuantity: parseFloat(newMedication.boxQuantity) || 0,
      status: daysLeft < 3 ? "critical" : daysLeft < 7 ? "warning" : "ok",
      instructions: newMedication.instructions
    });

    toast.success("Medicamento adicionado com sucesso!");
    setIsAddDialogOpen(false);
    setNewMedication({
      name: "",
      dosage: "",
      unit: "comprimido",
      patient: "",
      patientId: "",
      administrationRoute: "",
      frequency: "",
      times: "",
      prescriptionType: "",
      treatmentType: "continuo",
      treatmentStartDate: "",
      treatmentEndDate: "",
      hasTapering: false,
      taperingSchedule: [],
      boxQuantity: "",
      currentStock: "",
      dailyConsumption: "",
      instructions: ""
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "bg-[#a61f43] text-white";
      case "warning": return "bg-[#f2c36b] text-white";
      default: return "bg-[#a0bf80] text-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "critical": return "Crítico";
      case "warning": return "Atenção";
      default: return "Normal";
    }
  };

  const getTaperingIcon = (phase: string | undefined) => {
    if (!phase) return null;
    switch (phase) {
      case "aumento": return <TrendingUp className="h-4 w-4 text-[#6cced9]" />;
      case "reducao": return <TrendingDown className="h-4 w-4 text-[#f2c36b]" />;
      default: return null;
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
      inalacao: "inal"
    };
    return labels[unit] || unit;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#16808c]">Medicamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie todas as medicações dos pacientes</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#16808c] hover:bg-[#16808c]/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Medicamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#16808c]">Novo Medicamento</DialogTitle>
              <DialogDescription>
                Adicione um novo medicamento ao tratamento do paciente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="med-name">Nome do Medicamento *</Label>
                  <Input
                    id="med-name"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                    placeholder="Ex: Losartana"
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">Dosagem *</Label>
                  <Input
                    id="dosage"
                    type="number"
                    step="0.01"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                    placeholder="Ex: 50"
                  />
                </div>
              </div>

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
                  <Label htmlFor="times">Horários</Label>
                  <Input
                    id="times"
                    value={newMedication.times}
                    onChange={(e) => setNewMedication({ ...newMedication, times: e.target.value })}
                    placeholder="Ex: 08:00, 20:00"
                  />
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
                  </div>
                  {newMedication.treatmentType === "temporario" && (
                    <div>
                      <Label htmlFor="end-date">Data de Término (Prevista)</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={newMedication.treatmentEndDate}
                        onChange={(e) => setNewMedication({ ...newMedication, treatmentEndDate: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tapering */}
              <div className="flex items-start gap-2 p-4 bg-[#6cced9]/10 rounded-lg">
                <Checkbox
                  id="hasTapering"
                  checked={newMedication.hasTapering}
                  onCheckedChange={(checked) => 
                    setNewMedication({ ...newMedication, hasTapering: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="hasTapering" className="cursor-pointer flex items-center gap-2">
                    Este medicamento tem desmame (tapering)
                    <Info className="h-4 w-4 text-gray-400" />
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Marque se a dose aumenta ou diminui gradualmente durante o tratamento
                  </p>
                </div>
              </div>

              {/* Stock Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="box-quantity">Qtd. por Embalagem</Label>
                  <Input
                    id="box-quantity"
                    type="number"
                    step="0.01"
                    value={newMedication.boxQuantity}
                    onChange={(e) => setNewMedication({ ...newMedication, boxQuantity: e.target.value })}
                    placeholder="Ex: 30"
                  />
                </div>
                <div>
                  <Label htmlFor="current-stock">Estoque Atual</Label>
                  <Input
                    id="current-stock"
                    type="number"
                    step="0.01"
                    value={newMedication.currentStock}
                    onChange={(e) => setNewMedication({ ...newMedication, currentStock: e.target.value })}
                    placeholder="Ex: 60"
                  />
                </div>
                <div>
                  <Label htmlFor="daily-consumption">Consumo Diário</Label>
                  <Input
                    id="daily-consumption"
                    type="number"
                    step="0.01"
                    value={newMedication.dailyConsumption}
                    onChange={(e) => setNewMedication({ ...newMedication, dailyConsumption: e.target.value })}
                    placeholder="Ex: 2"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <Label htmlFor="instructions">Instruções e Observações</Label>
                <Textarea
                  id="instructions"
                  value={newMedication.instructions}
                  onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })}
                  placeholder="Ex: Tomar com alimentos, evitar leite, iniciar com dose reduzida..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                className="bg-[#16808c] hover:bg-[#16808c]/90"
                onClick={handleAddMedication}
              >
                Adicionar Medicamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            {patients.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#16808c]">{stats.total}</div>
              <div className="text-xs text-gray-600 mt-1">Total</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#a0bf80]">{stats.normal}</div>
              <div className="text-xs text-gray-600 mt-1">Normal</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#f2c36b]">{stats.warning}</div>
              <div className="text-xs text-gray-600 mt-1">Atenção</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#a61f43]">{stats.critical}</div>
              <div className="text-xs text-gray-600 mt-1">Crítico</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#6cced9]">{stats.temporary}</div>
              <div className="text-xs text-gray-600 mt-1">Temporários</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#16808c]">{stats.withTapering}</div>
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
                          {med.name} {med.dosage}{getUnitLabel(med.unit)}
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
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
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
                    <div className="font-medium text-sm">{med.times.join(", ")}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Receita</div>
                    <div className="font-medium text-sm">Tipo {med.prescriptionType}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Tratamento</div>
                    <div className="font-medium text-sm">
                      {med.treatmentType === "continuo" ? "Contínuo" : "Temporário"}
                    </div>
                  </div>
                </div>

                {/* Treatment Timeline for Temporary */}
                {med.treatmentType === "temporario" && med.treatmentEndDate && (
                  <div className="p-3 bg-[#6cced9]/10 rounded-lg flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-[#16808c]" />
                    <div className="flex-1 text-sm">
                      <span className="font-medium">Início:</span>{" "}
                      {new Date(med.treatmentStartDate).toLocaleDateString('pt-BR')}
                      <ArrowRight className="inline h-3 w-3 mx-2" />
                      <span className="font-medium">Término:</span>{" "}
                      {new Date(med.treatmentEndDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                )}

                {/* Tapering Info */}
                {med.hasTapering && med.currentTaperingPhase && (
                  <div className="p-3 bg-[#f2c36b]/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getTaperingIcon(med.currentTaperingPhase)}
                      <span className="font-medium text-sm">
                        Fase Atual: {med.currentTaperingPhase === "aumento" ? "Aumento Gradual" : 
                                     med.currentTaperingPhase === "reducao" ? "Redução Gradual" : 
                                     "Manutenção"}
                      </span>
                    </div>
                    {med.taperingSchedule && med.taperingSchedule.length > 0 && (
                      <div className="text-sm text-gray-600">
                        {med.taperingSchedule.map((schedule, idx) => (
                          <div key={idx} className="mt-1">
                            • {schedule.phase}: {schedule.dosage}{getUnitLabel(med.unit)} - {schedule.instructions}
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
                        {med.currentStock} {getUnitLabel(med.unit)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Dias Restantes</div>
                      <div className="font-medium">{med.daysLeft} dias</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Receita Válida Até</div>
                      <div className="font-medium">
                        {new Date(med.prescriptionExpiry).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                {med.instructions && (
                  <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Instruções:</span> {med.instructions}
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
