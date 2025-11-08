import { useState, useEffect } from "react";
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
  Shield,
  Search,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";
import { apiFetch } from "@/lib/api";
import { formatPhoneNumber, sanitizePhoneNumber } from "@/lib/utils";

interface Caregiver {
  id: string;
  name: string;
  email?: string;
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
    phone: sanitizePhoneNumber(currentUser?.phoneNumber)
  });

  const [newCaregiver, setNewCaregiver] = useState({
    name: "",
    email: "",
    phone: "",
    patients: [] as string[]
  });
  const [patientSearchTerm, setPatientSearchTerm] = useState("");

  const [newRepresentative, setNewRepresentative] = useState({
    email: ""
  });

  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [representatives, setRepresentatives] = useState<Representative[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cgs, reps] = await Promise.all([
          apiFetch<Caregiver[]>(`/caregivers`),
          apiFetch<Representative[]>(`/representatives`),
        ]);
        setCaregivers((cgs || []).map(c => ({
          ...c,
          phone: sanitizePhoneNumber(c.phone),
          addedBy: currentUser?.id || "",
        })));
        setRepresentatives(reps || []);
      } catch (e) {
        // silent; page can still work
      }
    };
    load();
  }, [currentUser?.id]);

  const handleEditProfile = async () => {
    try {
      await apiFetch(`/auth/update`, {
        method: 'POST',
        body: JSON.stringify({ name: profileData.name, phoneNumber: profileData.phone })
      });
      const updated = await apiFetch<any>(`/auth/me`);
      setProfileData({
        name: updated.name,
        email: updated.email,
        phone: sanitizePhoneNumber(updated.phoneNumber),
      });
      toast.success("Perfil atualizado com sucesso!");
      setIsEditProfileOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao atualizar perfil");
    }
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
          email: newCaregiver.email,
          phone: newCaregiver.phone,
          patients: newCaregiver.patients,
        }),
      });
      const updated = await apiFetch<Caregiver[]>(`/caregivers`);
      setCaregivers((updated || []).map(c => ({ ...c, addedBy: currentUser?.id || "" })));
      toast.success("Cuidador adicionado com sucesso!");
      setIsAddCaregiverOpen(false);
      setNewCaregiver({ name: "", email: "", phone: "", patients: [] });
      setPatientSearchTerm("");
    } catch (e) {
      toast.error("Erro ao adicionar cuidador");
    }
  };

  const handleAddRepresentative = async () => {
    if (!newRepresentative.email) {
      toast.error("Digite o email do representante");
      return;
    }
    try {
      await apiFetch(`/representatives`, {
        method: 'POST',
        body: JSON.stringify({ email: newRepresentative.email }),
      });
      const updated = await apiFetch<Representative[]>(`/representatives`);
      setRepresentatives(updated || []);
      toast.success("Convite enviado ao representante!");
      setIsAddRepresentativeOpen(false);
      setNewRepresentative({ email: "" });
    } catch (e) {
      toast.error("Erro ao adicionar representante");
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === "caregiver") {
        await apiFetch(`/caregivers/${itemToDelete.id}`, { method: 'DELETE' });
        const updated = await apiFetch<Caregiver[]>(`/caregivers`);
        setCaregivers((updated || []).map(c => ({ ...c, addedBy: currentUser?.id || "" })));
        toast.success("Cuidador removido com sucesso");
      } else {
        await apiFetch(`/representatives/${itemToDelete.id}`, { method: 'DELETE' });
        const updated = await apiFetch<Representative[]>(`/representatives`);
        setRepresentatives(updated || []);
        toast.success("Representante removido com sucesso");
      }
    } catch (e) {
      toast.error("Erro ao excluir");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteDialog = (type: "caregiver" | "representative", id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || "Paciente não encontrado";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#16808c]">Meu Perfil</h1>
        <p className="text-gray-600 mt-1">Gerencie suas informações e equipe de cuidados</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="px-6 pt-6">
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
                  value={formatPhoneNumber(profileData.phone)}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      phone: sanitizePhoneNumber(e.target.value),
                    })
                  }
                  placeholder="(00) 90000-0000"
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
        <CardContent className="px-6 pb-6">
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
                <div className="font-medium">
                  {profileData.phone ? formatPhoneNumber(profileData.phone) : "Não informado"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6cced9]/20 flex items-center justify-center">
                <User className="h-5 w-5 text-[#16808c]" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Membro desde</div>
                <div className="font-medium">
                  {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('pt-BR') : ""}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {/* Representatives Section */}
      <Card>
        <CardHeader className="px-6 pt-6">
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
        <CardContent className="px-6 pb-6">
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
