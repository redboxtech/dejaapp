import { useState, useMemo } from "react";
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
  Trash2
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
import { toast } from "sonner@2.0.3";
import { useData } from "./DataContext";
import { useAuth } from "./AuthContext";

interface PatientsPageProps {
  onNavigate: (page: string, id?: string) => void;
}

export function PatientsPage({ onNavigate }: PatientsPageProps) {
  const { patients, medications, addPatient, updatePatient, deletePatient, sharePatientWith } = useData();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [newPatient, setNewPatient] = useState({
    name: "",
    birthDate: "",
    careType: "",
    observations: ""
  });
  const [editingPatient, setEditingPatient] = useState({
    id: "",
    name: "",
    birthDate: "",
    careType: "",
    observations: ""
  });

  // Memoized filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  // Memoized stats
  const stats = useMemo(() => {
    const totalPatients = patients.length;
    const totalMedications = medications.length;
    const totalAlerts = patients.reduce((sum, p) => sum + p.criticalAlerts, 0);

    return { totalPatients, totalMedications, totalAlerts };
  }, [patients, medications]);

  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.birthDate) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const birthDate = new Date(newPatient.birthDate);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 86400000));

    addPatient({
      name: newPatient.name,
      age,
      birthDate: newPatient.birthDate,
      careType: newPatient.careType === "home" ? "Domiciliar" : "Institucional",
      medications: 0,
      caregivers: 0,
      lastUpdate: "Há poucos segundos",
      criticalAlerts: 0,
      observations: newPatient.observations
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

  const openShareDialog = (patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPatientId(patientId);
    setIsShareDialogOpen(true);
  };

  const canSharePatient = (patient: any) => {
    return currentUser && patient.ownerId === currentUser.id;
  };

  const openEditDialog = (patient: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPatient({
      id: patient.id,
      name: patient.name,
      birthDate: patient.birthDate,
      careType: patient.careType === "Domiciliar" ? "home" : "institution",
      observations: patient.observations
    });
    setIsEditDialogOpen(true);
  };

  const handleEditPatient = () => {
    if (!editingPatient.name || !editingPatient.birthDate) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const birthDate = new Date(editingPatient.birthDate);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 86400000));

    updatePatient(editingPatient.id, {
      name: editingPatient.name,
      age,
      birthDate: editingPatient.birthDate,
      careType: editingPatient.careType === "home" ? "Domiciliar" : "Institucional",
      observations: editingPatient.observations,
      lastUpdate: "Há poucos segundos"
    });

    toast.success("Paciente atualizado com sucesso!");
    setIsEditDialogOpen(false);
  };

  const openDeleteDialog = (patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPatientId(patientId);
    setDeleteDialogOpen(true);
  };

  const handleDeletePatient = () => {
    deletePatient(selectedPatientId);
    toast.success("Paciente excluído com sucesso");
    setDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#16808c]">Pacientes</h1>
          <p className="text-gray-600 mt-1">Gerencie os pacientes sob sua responsabilidade</p>
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
              <DialogTitle className="text-[#16808c]">Novo Paciente</DialogTitle>
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
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="Nome do paciente"
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={newPatient.birthDate}
                  onChange={(e) => setNewPatient({ ...newPatient, birthDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="careType">Tipo de Cuidado</Label>
                <Select
                  value={newPatient.careType}
                  onValueChange={(value) => setNewPatient({ ...newPatient, careType: value })}
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
                  onChange={(e) => setNewPatient({ ...newPatient, observations: e.target.value })}
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
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 rounded-full bg-[#6cced9]/20 flex items-center justify-center">
                <User className="h-6 w-6 text-[#16808c]" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-bold text-[#16808c]">{stats.totalPatients}</div>
                <div className="text-sm text-gray-600 truncate">Total de Pacientes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 rounded-full bg-[#a0bf80]/20 flex items-center justify-center">
                <Pill className="h-6 w-6 text-[#a0bf80]" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-bold text-[#16808c]">{stats.totalMedications}</div>
                <div className="text-sm text-gray-600 truncate">Medicamentos Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 rounded-full bg-[#f2c36b]/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-[#f2c36b]" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-bold text-[#f2c36b]">{stats.totalAlerts}</div>
                <div className="text-sm text-gray-600 truncate">Alertas Pendentes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-[#16808c]">Editar Paciente</DialogTitle>
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
                onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                placeholder="Nome do paciente"
              />
            </div>
            <div>
              <Label htmlFor="edit-birthDate">Data de Nascimento *</Label>
              <Input
                id="edit-birthDate"
                type="date"
                value={editingPatient.birthDate}
                onChange={(e) => setEditingPatient({ ...editingPatient, birthDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-careType">Tipo de Cuidado</Label>
              <Select
                value={editingPatient.careType}
                onValueChange={(value) => setEditingPatient({ ...editingPatient, careType: value })}
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
                onChange={(e) => setEditingPatient({ ...editingPatient, observations: e.target.value })}
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
            <DialogTitle className="text-[#16808c]">Compartilhar Paciente</DialogTitle>
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
                onChange={(e) => setShareEmail(e.target.value)}
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
              Esta ação não pode ser desfeita. O paciente e todos os seus dados (medicamentos, estoques, etc.) serão removidos permanentemente.
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
            onClick={() => onNavigate("patient-detail", patient.id)}
          >
            <CardContent className="p-4 sm:p-6">
              {/* Mobile Layout */}
              <div className="block sm:hidden space-y-4">
                {/* Header com Avatar e Nome */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-14 w-14 flex-shrink-0">
                    <AvatarFallback className="bg-[#6cced9] text-white">
                      {patient.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#16808c] text-lg truncate">{patient.name}</h3>
                        <p className="text-gray-600">{patient.age} anos</p>
                      </div>
                      <div className="flex gap-1">
                        {canSharePatient(patient) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0 h-8 w-8"
                              onClick={(e) => openEditDialog(patient, e)}
                            >
                              <Edit className="h-4 w-4 text-[#16808c]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0 h-8 w-8"
                              onClick={(e) => openShareDialog(patient.id, e)}
                            >
                              <Share2 className="h-4 w-4 text-[#16808c]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0 h-8 w-8 text-[#a61f43] hover:text-[#a61f43] hover:bg-[#a61f43]/10"
                              onClick={(e) => openDeleteDialog(patient.id, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {patient.criticalAlerts > 0 && (
                      <Badge variant="destructive" className="bg-[#a61f43] mt-1">
                        {patient.criticalAlerts} alerta{patient.criticalAlerts > 1 ? 's' : ''}
                      </Badge>
                    )}
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
                    <span className="truncate">{patient.caregivers} cuidador{patient.caregivers !== 1 ? 'es' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {patient.createdAt 
                        ? new Date(patient.createdAt).toLocaleString('pt-BR', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : patient.lastUpdate}
                    </span>
                  </div>
                </div>
                
                {/* Data de Aniversário - Mobile */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    <span className="font-medium">Aniversário:</span> {new Date(patient.birthDate).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Observações Mobile */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500 line-clamp-2">
                    <span className="font-medium">Obs:</span> {patient.observations}
                  </p>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex items-start gap-4">
                <Avatar className="h-16 w-16 flex-shrink-0">
                  <AvatarFallback className="bg-[#6cced9] text-white text-xl">
                    {patient.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-[#16808c] truncate">{patient.name}</h3>
                        {patient.ownerId !== currentUser?.id && (
                          <Badge variant="outline" className="bg-[#6cced9]/10 flex-shrink-0">
                            Compartilhado
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600">{patient.age} anos</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {patient.criticalAlerts > 0 && (
                        <Badge variant="destructive" className="bg-[#a61f43]">
                          {patient.criticalAlerts} alerta{patient.criticalAlerts > 1 ? 's' : ''}
                        </Badge>
                      )}
                      {canSharePatient(patient) && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => openEditDialog(patient, e)}
                          >
                            <Edit className="h-4 w-4 text-[#16808c]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => openShareDialog(patient.id, e)}
                          >
                            <Share2 className="h-4 w-4 text-[#16808c]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#a61f43] hover:text-[#a61f43] hover:bg-[#a61f43]/10"
                            onClick={(e) => openDeleteDialog(patient.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{patient.careType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Pill className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{patient.medications} medicamentos</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserPlus className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{patient.caregivers} cuidador{patient.caregivers > 1 ? 'es' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {patient.createdAt 
                          ? new Date(patient.createdAt).toLocaleString('pt-BR', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : patient.lastUpdate}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        <span className="font-medium">Aniversário:</span> {new Date(patient.birthDate).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 line-clamp-1 flex-1 min-w-0">
                      <span className="font-medium">Obs:</span> {patient.observations}
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
    </div>
  );
}
