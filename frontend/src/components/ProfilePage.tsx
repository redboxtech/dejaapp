import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  Edit, 
  UserPlus,
  Trash2,
  Users,
  Shield
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
import { Separator } from "./ui/separator";
import { toast } from "sonner@2.0.3";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";

interface Caregiver {
  id: string;
  name: string;
  email: string;
  phone: string;
  patients: string[]; // IDs dos pacientes
  addedBy: string;
  addedAt: string;
  status: "active" | "inactive";
}

interface Representative {
  id: string;
  name: string;
  email: string;
  addedAt: string;
  status: "active" | "inactive";
}

export function ProfilePage() {
  const { currentUser } = useAuth();
  const { patients } = useData();
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddCaregiverOpen, setIsAddCaregiverOpen] = useState(false);
  const [isAddRepresentativeOpen, setIsAddRepresentativeOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "caregiver" | "representative", id: string } | null>(null);

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: ""
  });

  const [newCaregiver, setNewCaregiver] = useState({
    name: "",
    email: "",
    phone: "",
    patients: [] as string[]
  });

  const [newRepresentative, setNewRepresentative] = useState({
    email: ""
  });

  // Mock data - Em produção viria do backend
  const [caregivers, setCaregivers] = useState<Caregiver[]>([
    {
      id: "cg1",
      name: "Ana Paula Silva",
      email: "ana.paula@email.com",
      phone: "(11) 98765-4321",
      patients: ["1", "2"],
      addedBy: currentUser?.id || "",
      addedAt: "2025-01-15",
      status: "active"
    },
    {
      id: "cg2",
      name: "Carlos Alberto",
      email: "carlos@email.com",
      phone: "(11) 91234-5678",
      patients: ["3"],
      addedBy: currentUser?.id || "",
      addedAt: "2025-02-10",
      status: "active"
    }
  ]);

  const [representatives, setRepresentatives] = useState<Representative[]>([]);

  const handleEditProfile = () => {
    toast.success("Perfil atualizado com sucesso!");
    setIsEditProfileOpen(false);
  };

  const handleAddCaregiver = () => {
    if (!newCaregiver.name || !newCaregiver.email) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const caregiver: Caregiver = {
      id: `cg_${Date.now()}`,
      name: newCaregiver.name,
      email: newCaregiver.email,
      phone: newCaregiver.phone,
      patients: newCaregiver.patients,
      addedBy: currentUser?.id || "",
      addedAt: new Date().toISOString().split('T')[0],
      status: "active"
    };

    setCaregivers([...caregivers, caregiver]);
    toast.success("Cuidador adicionado com sucesso!");
    setIsAddCaregiverOpen(false);
    setNewCaregiver({ name: "", email: "", phone: "", patients: [] });
  };

  const handleAddRepresentative = () => {
    if (!newRepresentative.email) {
      toast.error("Digite o email do representante");
      return;
    }

    // Verificar se já existe
    if (representatives.some(r => r.email === newRepresentative.email)) {
      toast.error("Este representante já foi adicionado");
      return;
    }

    const representative: Representative = {
      id: `rep_${Date.now()}`,
      name: "Representante Convidado", // Seria obtido do backend
      email: newRepresentative.email,
      addedAt: new Date().toISOString().split('T')[0],
      status: "active"
    };

    setRepresentatives([...representatives, representative]);
    toast.success("Convite enviado ao representante!");
    setIsAddRepresentativeOpen(false);
    setNewRepresentative({ email: "" });
  };

  const handleDeleteItem = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "caregiver") {
      setCaregivers(caregivers.filter(c => c.id !== itemToDelete.id));
      toast.success("Cuidador removido com sucesso");
    } else {
      setRepresentatives(representatives.filter(r => r.id !== itemToDelete.id));
      toast.success("Representante removido com sucesso");
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const openDeleteDialog = (type: "caregiver" | "representative", id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || "Paciente não encontrado";
  };

  const stats = useMemo(() => ({
    totalCaregivers: caregivers.filter(c => c.status === "active").length,
    totalRepresentatives: representatives.filter(r => r.status === "active").length,
  }), [caregivers, representatives]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#16808c]">Meu Perfil</h1>
        <p className="text-gray-600 mt-1">Gerencie suas informações e equipe de cuidados</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-[#16808c] text-white text-2xl">
                  {currentUser?.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl text-[#16808c]">{currentUser?.name}</CardTitle>
                <CardDescription>Representante Legal</CardDescription>
              </div>
            </div>
            <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-[#16808c]">Editar Perfil</DialogTitle>
                  <DialogDescription>
                    Atualize suas informações pessoais
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">O e-mail não pode ser alterado</p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                    Cancelar
                  </Button>
                  <Button className="bg-[#16808c] hover:bg-[#16808c]/90" onClick={handleEditProfile}>
                    Salvar Alterações
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6cced9]/20 flex items-center justify-center">
                <Mail className="h-5 w-5 text-[#16808c]" />
              </div>
              <div>
                <div className="text-xs text-gray-500">E-mail</div>
                <div className="font-medium">{currentUser?.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6cced9]/20 flex items-center justify-center">
                <Phone className="h-5 w-5 text-[#16808c]" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Telefone</div>
                <div className="font-medium">{profileData.phone || "Não informado"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6cced9]/20 flex items-center justify-center">
                <User className="h-5 w-5 text-[#16808c]" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Membro desde</div>
                <div className="font-medium">
                  {currentUser?.createdAt && new Date(currentUser.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#6cced9]/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-[#16808c]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#16808c]">{stats.totalCaregivers}</div>
                <div className="text-sm text-gray-600">Cuidadores Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#a0bf80]/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#a0bf80]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#16808c]">{stats.totalRepresentatives}</div>
                <div className="text-sm text-gray-600">Outros Representantes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Caregivers Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#16808c]">Cuidadores</CardTitle>
              <CardDescription>Gerencie os cuidadores responsáveis pelos pacientes</CardDescription>
            </div>
            <Dialog open={isAddCaregiverOpen} onOpenChange={setIsAddCaregiverOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#16808c] hover:bg-[#16808c]/90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Cuidador
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-[#16808c]">Novo Cuidador</DialogTitle>
                  <DialogDescription>
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
                    <Label htmlFor="cg-email">E-mail *</Label>
                    <Input
                      id="cg-email"
                      type="email"
                      value={newCaregiver.email}
                      onChange={(e) => setNewCaregiver({ ...newCaregiver, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cg-phone">Telefone</Label>
                    <Input
                      id="cg-phone"
                      type="tel"
                      value={newCaregiver.phone}
                      onChange={(e) => setNewCaregiver({ ...newCaregiver, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <Label>Pacientes Atribuídos</Label>
                    <div className="space-y-2 mt-2">
                      {patients.length === 0 ? (
                        <p className="text-sm text-gray-500">Nenhum paciente cadastrado</p>
                      ) : (
                        patients.map(patient => (
                          <div key={patient.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`patient-${patient.id}`}
                              checked={newCaregiver.patients.includes(patient.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewCaregiver({
                                    ...newCaregiver,
                                    patients: [...newCaregiver.patients, patient.id]
                                  });
                                } else {
                                  setNewCaregiver({
                                    ...newCaregiver,
                                    patients: newCaregiver.patients.filter(id => id !== patient.id)
                                  });
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor={`patient-${patient.id}`} className="text-sm cursor-pointer">
                              {patient.name}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddCaregiverOpen(false)}>
                    Cancelar
                  </Button>
                  <Button className="bg-[#16808c] hover:bg-[#16808c]/90" onClick={handleAddCaregiver}>
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {caregivers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum cuidador cadastrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {caregivers.map((caregiver) => (
                <div key={caregiver.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-[#6cced9] text-white">
                      {caregiver.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[#16808c]">{caregiver.name}</h4>
                        <p className="text-sm text-gray-600">{caregiver.email}</p>
                        {caregiver.phone && <p className="text-sm text-gray-600">{caregiver.phone}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#a61f43] hover:text-[#a61f43] hover:bg-[#a61f43]/10"
                        onClick={() => openDeleteDialog("caregiver", caregiver.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {caregiver.patients.map(patientId => (
                        <Badge key={patientId} variant="outline" className="text-xs">
                          {getPatientName(patientId)}
                        </Badge>
                      ))}
                      {caregiver.patients.length === 0 && (
                        <span className="text-xs text-gray-500">Nenhum paciente atribuído</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Representatives Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#16808c]">Outros Representantes</CardTitle>
              <CardDescription>Compartilhe a gestão com outros representantes legais</CardDescription>
            </div>
            <Dialog open={isAddRepresentativeOpen} onOpenChange={setIsAddRepresentativeOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#16808c] hover:bg-[#16808c]/90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Representante
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-[#16808c]">Adicionar Representante</DialogTitle>
                  <DialogDescription>
                    Convide outro representante legal para ter acesso
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rep-email">E-mail do Representante</Label>
                    <Input
                      id="rep-email"
                      type="email"
                      value={newRepresentative.email}
                      onChange={(e) => setNewRepresentative({ email: e.target.value })}
                      placeholder="representante@email.com"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Um convite será enviado para este e-mail
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddRepresentativeOpen(false)}>
                    Cancelar
                  </Button>
                  <Button className="bg-[#16808c] hover:bg-[#16808c]/90" onClick={handleAddRepresentative}>
                    Enviar Convite
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {representatives.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum outro representante adicionado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {representatives.map((rep) => (
                <div key={rep.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-[#a0bf80] text-white">
                        {rep.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-[#16808c]">{rep.name}</h4>
                      <p className="text-sm text-gray-600">{rep.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#a61f43] hover:text-[#a61f43] hover:bg-[#a61f43]/10"
                    onClick={() => openDeleteDialog("representative", rep.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O {itemToDelete?.type === "caregiver" ? "cuidador" : "representante"} será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
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
