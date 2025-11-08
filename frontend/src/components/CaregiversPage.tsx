// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { useData } from "./DataContext";
import { apiFetch } from "@/lib/api";
import { formatPhoneNumber, sanitizePhoneNumber } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
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
import { Search, UserPlus, Users, Edit, Trash2, Mail, Phone, Loader2 } from "lucide-react";

interface Caregiver {
  id: string;
  name: string;
  email?: string;
  phone: string;
  patients: string[];
  color?: string;
}

const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  phone: "",
  patients: [] as string[],
  color: "#16808c",
};

export function CaregiversPage() {
  const { patients } = useData();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientSearchTerm, setPatientSearchTerm] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formState, setFormState] =
    useState<typeof INITIAL_FORM_STATE>(INITIAL_FORM_STATE);
  const [editingCaregiver, setEditingCaregiver] = useState<Caregiver | null>(
    null
  );
  const [caregiverToDelete, setCaregiverToDelete] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadCaregivers();
  }, []);

  const loadCaregivers = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<Caregiver[]>(`/caregivers`);
      setCaregivers(
        (data || []).map((cg) => ({
          ...cg,
          phone: sanitizePhoneNumber(cg.phone),
        }))
      );
    } catch (error) {
      console.error("Erro ao carregar cuidadores:", error);
      toast.error("Não foi possível carregar os cuidadores");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCaregivers = useMemo(() => {
    if (!searchTerm) return caregivers;
    const term = searchTerm.toLowerCase();
    const termDigits = searchTerm.replace(/\D/g, "");
    return caregivers.filter((cg) => {
      const patientNames = cg.patients
        .map((id) => patients.find((p) => p.id === id)?.name || "")
        .join(" ")
        .toLowerCase();
      const matchesPhone =
        termDigits.length > 0 ? cg.phone?.includes(termDigits) : false;
      return (
        cg.name.toLowerCase().includes(term) ||
        matchesPhone ||
        cg.email?.toLowerCase().includes(term) ||
        patientNames.includes(term)
      );
    });
  }, [caregivers, searchTerm, patients]);

  const resetForm = () => {
    setFormState(INITIAL_FORM_STATE);
    setPatientSearchTerm("");
  };

  const handleAddCaregiver = async () => {
    if (!formState.name || !formState.phone) {
      toast.error("Nome e telefone são obrigatórios");
      return;
    }
    try {
      await apiFetch(`/caregivers`, {
        method: "POST",
        body: JSON.stringify({
          name: formState.name,
          email: formState.email || undefined,
          phone: formState.phone,
          patients: formState.patients,
          color: formState.color,
        }),
      });
      toast.success("Cuidador cadastrado com sucesso");
      setIsAddModalOpen(false);
      resetForm();
      await loadCaregivers();
    } catch (error: any) {
      console.error("Erro ao cadastrar cuidador:", error);
      toast.error(error?.message || "Erro ao cadastrar cuidador");
    }
  };

  const handleUpdateCaregiver = async () => {
    if (!editingCaregiver) return;
    if (!editingCaregiver.name || !editingCaregiver.phone) {
      toast.error("Nome e telefone são obrigatórios");
      return;
    }
    try {
      await apiFetch(`/caregivers/${editingCaregiver.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editingCaregiver.name,
          email: editingCaregiver.email || undefined,
          phone: editingCaregiver.phone,
          patients: editingCaregiver.patients,
          color: editingCaregiver.color || "#16808c",
        }),
      });
      toast.success("Dados do cuidador atualizados");
      setIsEditModalOpen(false);
      setEditingCaregiver(null);
      await loadCaregivers();
    } catch (error: any) {
      console.error("Erro ao atualizar cuidador:", error);
      toast.error(error?.message || "Erro ao atualizar cuidador");
    }
  };

  const handleDeleteCaregiver = async () => {
    if (!caregiverToDelete) return;
    try {
      await apiFetch(`/caregivers/${caregiverToDelete}`, { method: "DELETE" });
      toast.success("Cuidador removido com sucesso");
      setIsDeleteDialogOpen(false);
      setCaregiverToDelete(null);
      await loadCaregivers();
    } catch (error: any) {
      console.error("Erro ao remover cuidador:", error);
      toast.error(error?.message || "Erro ao remover cuidador");
    }
  };

  const renderPatientSelection = ({
    selectedIds,
    onToggle,
  }: {
    selectedIds: string[];
    onToggle: (id: string) => void;
  }) => {
    const filteredPatients = patients.filter((patient) =>
      patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase())
    );
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar pacientes..."
            value={patientSearchTerm}
            onChange={(e) => setPatientSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b">
            {selectedIds.map((id) => {
              const patient = patients.find((p) => p.id === id);
              if (!patient) return null;
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {patient.name}
                  <button
                    type="button"
                    className="ml-1 hover:text-red-500"
                    onClick={() => onToggle(id)}
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        <div className="border rounded-md max-h-60 overflow-y-auto">
          <div className="p-2 space-y-1">
            {filteredPatients.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum paciente encontrado
              </p>
            )}
            {filteredPatients.map((patient) => {
              const isSelected = selectedIds.includes(patient.id);
              return (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => onToggle(patient.id)}
                  className={`w-full text-left p-2 rounded transition-colors border ${
                    isSelected
                      ? "bg-[#16808c]/10 border-[#16808c]"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium text-sm">{patient.name}</div>
                  <div className="text-xs text-gray-500">
                    {patient.age} anos • {patient.careType}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        {selectedIds.length > 0 && (
          <p className="text-xs text-gray-500">
            {selectedIds.length} paciente
            {selectedIds.length > 1 ? "s" : ""} selecionado
            {selectedIds.length > 1 ? "s" : ""}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Cuidadores</h1>
          <p className="text-gray-500 mt-1">
            Registre cuidadores, mantenha informações atualizadas e vincule pacientes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Buscar cuidador ou paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          <Dialog open={isAddModalOpen} onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#16808c] hover:bg-[#0f6069]">
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Cuidador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#16808c] flex items-center gap-2">
                  <UserPlus className="h-6 w-6" />
                  Cadastro de Cuidador
                </DialogTitle>
                <DialogDescription>
                  Informe os dados do cuidador e associe pacientes responsáveis.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cg-name">Nome completo *</Label>
                  <Input
                    id="cg-name"
                    value={formState.name}
                    onChange={(e) =>
                      setFormState({ ...formState, name: e.target.value })
                    }
                    placeholder="Nome do cuidador"
                  />
                </div>
                <div>
                  <Label htmlFor="cg-color">Cor para destacar no calendário</Label>
                  <div className="mt-1 flex items-center gap-3">
                    <input
                      id="cg-color"
                      type="color"
                      value={formState.color}
                      onChange={(e) =>
                        setFormState({ ...formState, color: e.target.value })
                      }
                      className="h-9 w-14 cursor-pointer rounded border border-gray-200 bg-white"
                    />
                    <span className="text-xs text-gray-500">
                      Esta cor será utilizada para identificar escalas deste cuidador.
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cg-email">E-mail (opcional)</Label>
                  <Input
                    id="cg-email"
                    type="email"
                    value={formState.email}
                    onChange={(e) =>
                      setFormState({ ...formState, email: e.target.value })
                    }
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="cg-phone">WhatsApp *</Label>
                  <Input
                    id="cg-phone"
                    type="tel"
                    value={formatPhoneNumber(formState.phone)}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        phone: sanitizePhoneNumber(e.target.value),
                      })
                    }
                    placeholder="(00) 90000-0000"
                  />
                </div>
                <div>
                  <Label>Pacientes vinculados</Label>
                  {patients.length === 0 ? (
                    <p className="text-sm text-gray-500 mt-2">
                      Cadastre pacientes para vinculá-los a cuidadores.
                    </p>
                  ) : (
                    renderPatientSelection({
                      selectedIds: formState.patients,
                      onToggle: (id) => {
                        setFormState((prev) => ({
                          ...prev,
                          patients: prev.patients.includes(id)
                            ? prev.patients.filter((pid) => pid !== id)
                            : [...prev.patients, id],
                        }));
                      },
                    })
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button
                  className="bg-[#16808c] hover:bg-[#0f6069]"
                  onClick={handleAddCaregiver}
                >
                  Salvar cuidador
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4 px-6 pt-6">
          <CardTitle className="flex items-center gap-2 text-[#16808c]">
            <Users className="h-5 w-5" />
            Cuidadores cadastrados
          </CardTitle>
          <CardDescription>
            Visão geral dos cuidadores ativos e seus respectivos pacientes.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="h-6 w-6 mr-2 animate-spin" />
              Carregando cuidadores...
            </div>
          ) : filteredCaregivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
              <Users className="h-12 w-12 mb-3 text-gray-300" />
              <p className="text-lg">
                {searchTerm
                  ? "Nenhum cuidador encontrado para a busca informada."
                  : "Nenhum cuidador cadastrado ainda."}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Utilize o botão "Novo Cuidador" para realizar cadastros.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredCaregivers.map((caregiver) => {
                const patientBadges = caregiver.patients
                  .map((id) => patients.find((p) => p.id === id))
                  .filter(Boolean);
                const initials = caregiver.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <Card
                    key={caregiver.id}
                    className="border border-gray-200 hover:border-[#16808c]/40 transition-colors h-full flex flex-col rounded-xl shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2 px-6 pt-6">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-12 h-12 rounded-full text-white flex items-center justify-center font-semibold text-lg"
                          style={{ backgroundColor: caregiver.color || "#6cced9" }}
                        >
                          {initials}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <CardTitle className="text-lg text-[#16808c] truncate">
                            {caregiver.name}
                          </CardTitle>
                          {caregiver.email && (
                            <CardDescription className="flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3" />
                              {caregiver.email}
                            </CardDescription>
                          )}
                          {caregiver.phone && (
                            <CardDescription className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {formatPhoneNumber(caregiver.phone)}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-[#16808c] hover:bg-[#16808c]/10"
                          onClick={() => {
                            setEditingCaregiver({
                              ...caregiver,
                              phone: sanitizePhoneNumber(caregiver.phone),
                              patients: [...caregiver.patients],
                            });
                            setPatientSearchTerm("");
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-[#a61f43] hover:bg-[#a61f43]/10"
                          onClick={() => {
                            setCaregiverToDelete(caregiver.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="px-6 pb-6 mt-4 space-y-3 flex-1">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Pacientes vinculados
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {patientBadges.length > 0 ? (
                            patientBadges.map((patient) => (
                              <Badge key={patient!.id} variant="secondary" className="text-xs">
                                {patient!.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">
                              Nenhum paciente atribuído
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        setIsEditModalOpen(open);
        if (!open) {
          setEditingCaregiver(null);
          setPatientSearchTerm("");
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#16808c] flex items-center gap-2">
              <Edit className="h-6 w-6" />
              Editar cuidador
            </DialogTitle>
            <DialogDescription>
              Atualize as informações e os pacientes vinculados ao cuidador.
            </DialogDescription>
          </DialogHeader>
          {editingCaregiver && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome completo *</Label>
                <Input
                  id="edit-name"
                  value={editingCaregiver.name}
                  onChange={(e) =>
                    setEditingCaregiver({
                      ...editingCaregiver,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-color">Cor para o calendário</Label>
                <input
                  id="edit-color"
                  type="color"
                  value={editingCaregiver.color || "#16808c"}
                  onChange={(e) =>
                    setEditingCaregiver({
                      ...editingCaregiver,
                      color: e.target.value,
                    })
                  }
                  className="h-9 w-14 cursor-pointer rounded border border-gray-200 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingCaregiver.email || ""}
                  onChange={(e) =>
                    setEditingCaregiver({
                      ...editingCaregiver,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">WhatsApp *</Label>
                <Input
                  id="edit-phone"
                  value={formatPhoneNumber(editingCaregiver.phone)}
                  onChange={(e) =>
                    setEditingCaregiver({
                      ...editingCaregiver,
                      phone: sanitizePhoneNumber(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Pacientes vinculados</Label>
                {patients.length === 0 ? (
                  <p className="text-sm text-gray-500 mt-2">
                    Cadastre pacientes para vinculá-los a cuidadores.
                  </p>
                ) : (
                  renderPatientSelection({
                    selectedIds: editingCaregiver.patients || [],
                    onToggle: (id) => {
                      const current = editingCaregiver.patients || [];
                      setEditingCaregiver({
                        ...editingCaregiver,
                        patients: current.includes(id)
                          ? current.filter((pid) => pid !== id)
                          : [...current, id],
                      });
                    },
                  })
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditModalOpen(false);
              setEditingCaregiver(null);
            }}>
              Cancelar
            </Button>
            <Button className="bg-[#16808c] hover:bg-[#0f6069]" onClick={handleUpdateCaregiver}>
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover cuidador</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as escalas associadas serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCaregiverToDelete(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteCaregiver}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


