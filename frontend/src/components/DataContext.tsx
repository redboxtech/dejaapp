import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useAuth } from "./AuthContext";

// Types
export type MedicationUnit = "comprimido" | "ml" | "gotas" | "mg" | "g" | "aplicacao" | "inalacao";
export type TreatmentType = "continuo" | "temporario";
export type TaperingPhase = "aumento" | "manutencao" | "reducao" | "finalizado";

export interface TaperingSchedule {
  phase: TaperingPhase;
  startDate: string;
  endDate?: string;
  dosage: number;
  frequency: string;
  instructions: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: number;
  unit: MedicationUnit;
  patient: string;
  patientId: string;
  route: string;
  frequency: string;
  times: string[];
  prescriptionType: string;
  prescriptionExpiry: string;
  treatmentType: TreatmentType;
  treatmentStartDate: string;
  treatmentEndDate?: string;
  hasTapering: boolean;
  taperingSchedule?: TaperingSchedule[];
  currentTaperingPhase?: TaperingPhase;
  currentStock: number;
  dailyConsumption: number;
  daysLeft: number;
  boxQuantity: number;
  status: "ok" | "warning" | "critical";
  instructions?: string;
  ownerId: string; // ID do representante que cadastrou
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  birthDate: string;
  careType: string;
  medications: number;
  caregivers: number;
  lastUpdate: string;
  criticalAlerts: number;
  observations: string;
  ownerId: string; // ID do representante que cadastrou
  sharedWith: string[]; // IDs de outros representantes que têm acesso
}

export interface StockItem {
  id: string;
  medication: string;
  medicationId: string;
  patient: string;
  current: number;
  dailyConsumption: number;
  daysLeft: number;
  estimatedEndDate: string;
  boxQuantity: number;
  unit: MedicationUnit;
  status: "ok" | "warning" | "critical";
  movements: StockMovement[];
  ownerId: string;
}

export interface StockMovement {
  type: "in" | "out";
  quantity: number;
  date: string;
  source: string;
}

export interface ReplenishmentRequest {
  id: string;
  medication: string;
  medicationId: string;
  patient: string;
  requestedBy: string;
  requestDate: string;
  currentStock: number;
  requestedQuantity: number;
  estimatedEndDate: string;
  urgency: "high" | "medium" | "low";
  status: "pending" | "completed" | "rejected";
  notes: string;
  completedDate?: string;
  addedQuantity?: number;
  ownerId: string;
}

interface DataContextType {
  patients: Patient[];
  medications: Medication[];
  stockItems: StockItem[];
  replenishmentRequests: ReplenishmentRequest[];
  addPatient: (patient: Omit<Patient, "id" | "ownerId" | "sharedWith">) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  sharePatientWith: (patientId: string, representativeEmail: string) => Promise<boolean>;
  addMedication: (medication: Omit<Medication, "id" | "ownerId">) => void;
  updateMedication: (id: string, medication: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  addStockEntry: (medicationId: string, quantity: number, source: string) => void;
  approveReplenishment: (id: string, quantity: number) => void;
  rejectReplenishment: (id: string) => void;
  getMedicationsByPatient: (patientId: string) => Medication[];
  getStockByMedication: (medicationId: string) => StockItem | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [replenishmentRequests, setReplenishmentRequests] = useState<ReplenishmentRequest[]>([]);

  // Carregar dados do usuário atual quando ele faz login
  useEffect(() => {
    if (currentUser) {
      loadUserData(currentUser.id);
    } else {
      // Limpar dados quando faz logout
      setPatients([]);
      setMedications([]);
      setStockItems([]);
      setReplenishmentRequests([]);
    }
  }, [currentUser]);

  const loadUserData = (userId: string) => {
    // Carregar pacientes do usuário
    const userPatients = JSON.parse(localStorage.getItem(`deja_patients_${userId}`) || "[]");
    
    // Carregar também pacientes compartilhados com este usuário
    const allUsers = JSON.parse(localStorage.getItem("deja_users") || "[]");
    const sharedPatients: Patient[] = [];
    
    allUsers.forEach((user: any) => {
      if (user.id !== userId) {
        const otherUserPatients = JSON.parse(localStorage.getItem(`deja_patients_${user.id}`) || "[]");
        otherUserPatients.forEach((patient: Patient) => {
          if (patient.sharedWith && patient.sharedWith.includes(userId)) {
            sharedPatients.push(patient);
          }
        });
      }
    });

    const allPatients = [...userPatients, ...sharedPatients];
    setPatients(allPatients);

    // Carregar medicamentos
    const userMedications = JSON.parse(localStorage.getItem(`deja_medications_${userId}`) || "[]");
    setMedications(userMedications);

    // Carregar estoques
    const userStocks = JSON.parse(localStorage.getItem(`deja_stocks_${userId}`) || "[]");
    setStockItems(userStocks);

    // Carregar solicitações
    const userRequests = JSON.parse(localStorage.getItem(`deja_requests_${userId}`) || "[]");
    setReplenishmentRequests(userRequests);
  };

  // Salvar dados sempre que mudarem
  useEffect(() => {
    if (currentUser) {
      // Salvar apenas os pacientes que o usuário criou (não os compartilhados)
      const ownPatients = patients.filter(p => p.ownerId === currentUser.id);
      localStorage.setItem(`deja_patients_${currentUser.id}`, JSON.stringify(ownPatients));
    }
  }, [patients, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`deja_medications_${currentUser.id}`, JSON.stringify(medications));
    }
  }, [medications, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`deja_stocks_${currentUser.id}`, JSON.stringify(stockItems));
    }
  }, [stockItems, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`deja_requests_${currentUser.id}`, JSON.stringify(replenishmentRequests));
    }
  }, [replenishmentRequests, currentUser]);

  const getMedicationsByPatient = useMemo(() => {
    return (patientId: string) => medications.filter(m => m.patientId === patientId);
  }, [medications]);

  const getStockByMedication = useMemo(() => {
    return (medicationId: string) => stockItems.find(s => s.medicationId === medicationId);
  }, [stockItems]);

  const addPatient = (patient: Omit<Patient, "id" | "ownerId" | "sharedWith">) => {
    if (!currentUser) return;

    const newPatient: Patient = { 
      ...patient, 
      id: `patient_${Date.now()}`,
      ownerId: currentUser.id,
      sharedWith: []
    };
    setPatients(prev => [...prev, newPatient]);
  };

  const updatePatient = (id: string, patient: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...patient } : p));
  };

  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    // Deletar também medicamentos e estoques relacionados
    setMedications(prev => prev.filter(m => m.patientId !== id));
    setStockItems(prev => prev.filter(s => {
      const med = medications.find(m => m.id === s.medicationId);
      return med?.patientId !== id;
    }));
  };

  const sharePatientWith = async (patientId: string, representativeEmail: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      // Encontrar o representante pelo email
      const users = JSON.parse(localStorage.getItem("deja_users") || "[]");
      const targetUser = users.find((u: any) => u.email === representativeEmail);

      if (!targetUser) {
        throw new Error("Representante não encontrado");
      }

      if (targetUser.id === currentUser.id) {
        throw new Error("Você não pode compartilhar com você mesmo");
      }

      // Atualizar o paciente para incluir o novo representante
      const patient = patients.find(p => p.id === patientId);
      if (!patient) {
        throw new Error("Paciente não encontrado");
      }

      if (patient.ownerId !== currentUser.id) {
        throw new Error("Você não tem permissão para compartilhar este paciente");
      }

      if (patient.sharedWith.includes(targetUser.id)) {
        throw new Error("Este paciente já está compartilhado com este representante");
      }

      const updatedPatient = {
        ...patient,
        sharedWith: [...patient.sharedWith, targetUser.id]
      };

      setPatients(prev => prev.map(p => p.id === patientId ? updatedPatient : p));
      
      return true;
    } catch (error) {
      console.error("Erro ao compartilhar paciente:", error);
      return false;
    }
  };

  const addMedication = (medication: Omit<Medication, "id" | "ownerId">) => {
    if (!currentUser) return;

    const newMedication: Medication = { 
      ...medication, 
      id: `med_${Date.now()}`,
      ownerId: currentUser.id
    };
    setMedications(prev => [...prev, newMedication]);
    
    // Criar entrada de estoque inicial
    const newStock: StockItem = {
      id: `stock_${Date.now()}`,
      medication: `${medication.name} ${medication.dosage}${medication.unit}`,
      medicationId: newMedication.id,
      patient: medication.patient,
      current: medication.currentStock,
      dailyConsumption: medication.dailyConsumption,
      daysLeft: medication.daysLeft,
      estimatedEndDate: new Date(Date.now() + medication.daysLeft * 86400000).toISOString().split('T')[0],
      boxQuantity: medication.boxQuantity,
      unit: medication.unit,
      status: medication.status,
      movements: [{
        type: "in",
        quantity: medication.currentStock,
        date: new Date().toISOString().split('T')[0],
        source: "Estoque inicial"
      }],
      ownerId: currentUser.id
    };
    setStockItems(prev => [...prev, newStock]);
  };

  const updateMedication = (id: string, medication: Partial<Medication>) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, ...medication } : m));
  };

  const deleteMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    setStockItems(prev => prev.filter(s => s.medicationId !== id));
  };

  const addStockEntry = (medicationId: string, quantity: number, source: string) => {
    setStockItems(prev => prev.map(item => {
      if (item.medicationId === medicationId) {
        const newCurrent = item.current + quantity;
        const newDaysLeft = Math.floor(newCurrent / item.dailyConsumption);
        const newEndDate = new Date(Date.now() + newDaysLeft * 86400000).toISOString().split('T')[0];
        
        return {
          ...item,
          current: newCurrent,
          daysLeft: newDaysLeft,
          estimatedEndDate: newEndDate,
          status: newDaysLeft < 3 ? "critical" : newDaysLeft < 7 ? "warning" : "ok",
          movements: [
            { type: "in" as const, quantity, date: new Date().toISOString().split('T')[0], source },
            ...item.movements
          ]
        };
      }
      return item;
    }));

    // Atualizar medicação também
    setMedications(prev => prev.map(med => {
      const stock = stockItems.find(s => s.medicationId === medicationId);
      if (med.id === medicationId && stock) {
        const newCurrent = stock.current + quantity;
        const newDaysLeft = Math.floor(newCurrent / med.dailyConsumption);
        return {
          ...med,
          currentStock: newCurrent,
          daysLeft: newDaysLeft,
          status: newDaysLeft < 3 ? "critical" : newDaysLeft < 7 ? "warning" : "ok"
        };
      }
      return med;
    }));
  };

  const approveReplenishment = (id: string, quantity: number) => {
    const request = replenishmentRequests.find(r => r.id === id);
    if (request) {
      addStockEntry(request.medicationId, quantity, `Reposição aprovada - Req #${id}`);
      setReplenishmentRequests(prev => prev.map(r => 
        r.id === id 
          ? { ...r, status: "completed" as const, completedDate: new Date().toISOString().split('T')[0], addedQuantity: quantity }
          : r
      ));
    }
  };

  const rejectReplenishment = (id: string) => {
    setReplenishmentRequests(prev => prev.map(r => 
      r.id === id ? { ...r, status: "rejected" as const } : r
    ));
  };

  const value = {
    patients,
    medications,
    stockItems,
    replenishmentRequests,
    addPatient,
    updatePatient,
    deletePatient,
    sharePatientWith,
    addMedication,
    updateMedication,
    deleteMedication,
    addStockEntry,
    approveReplenishment,
    rejectReplenishment,
    getMedicationsByPatient,
    getStockByMedication,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
