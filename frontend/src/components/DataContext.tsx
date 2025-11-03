import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../lib/api";

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
  createdAt: string; // Data e hora de cadastro (ISO string)
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
      loadFromApi();
    } else {
      // Limpar dados quando faz logout
      setPatients([]);
      setMedications([]);
      setStockItems([]);
      setReplenishmentRequests([]);
    }
  }, [currentUser]);

  const loadFromApi = async () => {
    try {
      const [patientsRes, medicationsRes, requestsRes, stockRes] = await Promise.all([
        apiFetch<Patient[]>(`/patients`),
        apiFetch<Medication[]>(`/medications`),
        apiFetch<ReplenishmentRequest[]>(`/replenishment`),
        apiFetch<StockItem[]>(`/stock`),
      ]);
      setPatients(patientsRes || []);
      setMedications(medicationsRes || []);
      setReplenishmentRequests(requestsRes || []);
      setStockItems(stockRes || []);
    } catch (e) {
      console.error('Erro ao carregar dados da API', e);
    }
  };

  // Removido: persistência em localStorage substituída por API

  const getMedicationsByPatient = useMemo(() => {
    return (patientId: string) => medications.filter(m => m.patientId === patientId);
  }, [medications]);

  const getStockByMedication = useMemo(() => {
    return (medicationId: string) => stockItems.find(s => s.medicationId === medicationId);
  }, [stockItems]);

  const addPatient = async (patient: Omit<Patient, "id" | "ownerId" | "sharedWith">) => {
    try {
      // Mapear para AddPatientCommand
      const careTypeMap: Record<string, number> = { Domiciliar: 0, Institucional: 1 };
      const body = {
        name: patient.name,
        birthDate: patient.birthDate, // "yyyy-MM-dd"
        careType: careTypeMap[patient.careType] ?? 0,
        observations: patient.observations ?? "",
      };
      await apiFetch<string>(`/patients`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      await loadFromApi();
    } catch (e) {
      console.error('Erro ao adicionar paciente', e);
    }
  };

  const updatePatient = async (id: string, patient: Partial<Patient>) => {
    try {
      const careTypeMap: Record<string, number> = { Domiciliar: 0, Institucional: 1 };
      const body = {
        id,
        name: patient.name,
        birthDate: patient.birthDate, // "yyyy-MM-dd"
        careType: patient.careType ? careTypeMap[patient.careType] ?? 0 : undefined,
        observations: patient.observations,
      };
      await apiFetch(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      await loadFromApi();
    } catch (e) {
      console.error('Erro ao atualizar paciente', e);
    }
  };

  const deletePatient = async (id: string) => {
    try {
      await apiFetch(`/patients/${id}`, { method: 'DELETE' });
      await loadFromApi();
    } catch (e) {
      console.error('Erro ao deletar paciente', e);
    }
  };

  const sharePatientWith = async (patientId: string, representativeEmail: string): Promise<boolean> => {
    try {
      await apiFetch(`/patients/${patientId}/share`, {
        method: 'POST',
        body: JSON.stringify({ patientId, representativeEmail }),
      });
      await loadFromApi();
      return true;
    } catch (error) {
      console.error("Erro ao compartilhar paciente:", error);
      return false;
    }
  };

  const addMedication = async (medication: Omit<Medication, "id" | "ownerId">) => {
    try {
      const treatmentTypeMap: Record<string, number> = { continuo: 0, temporario: 1 };
      const normalizedTimes = (medication.times || [])
        .flatMap(t => (typeof t === 'string' ? t.split(/[;,]/) : [t]))
        .map(t => String(t).trim())
        .filter(Boolean);
      const startDate = medication.treatmentStartDate && medication.treatmentStartDate.length > 0
        ? medication.treatmentStartDate
        : new Date().toISOString().split('T')[0];
      const body = {
        name: medication.name,
        dosage: medication.dosage,
        unit: medication.unit,
        patientId: medication.patientId,
        route: medication.route,
        frequency: medication.frequency,
        times: normalizedTimes,
        treatmentType: treatmentTypeMap[medication.treatmentType] ?? 0,
        treatmentStartDate: startDate,
        treatmentEndDate: medication.treatmentEndDate || null,
        hasTapering: medication.hasTapering,
        currentStock: medication.currentStock,
        dailyConsumption: medication.dailyConsumption,
        boxQuantity: medication.boxQuantity,
        instructions: medication.instructions || "",
      };
      await apiFetch(`/medications`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      await loadFromApi();
    } catch (e) {
      console.error('Erro ao adicionar medicação', e);
    }
  };

  const updateMedication = async (id: string, medication: Partial<Medication>) => {
    try {
      const treatmentTypeMap: Record<string, number> = { continuo: 0, temporario: 1 };
      const normalizedTimes = (medication.times || [])
        .flatMap(t => (typeof t === 'string' ? t.split(/[;,]/) : [t]))
        .map(t => String(t).trim())
        .filter(Boolean);
      const startDate = medication.treatmentStartDate && medication.treatmentStartDate.length > 0
        ? medication.treatmentStartDate
        : undefined;
      const body = {
        id,
        name: medication.name,
        dosage: medication.dosage,
        unit: medication.unit,
        route: medication.route,
        frequency: medication.frequency,
        times: normalizedTimes.length > 0 ? normalizedTimes : undefined,
        treatmentType: medication.treatmentType ? treatmentTypeMap[medication.treatmentType] ?? 0 : undefined,
        treatmentStartDate: startDate,
        treatmentEndDate: medication.treatmentEndDate ?? null,
        hasTapering: medication.hasTapering,
        dailyConsumption: medication.dailyConsumption,
        boxQuantity: medication.boxQuantity,
        instructions: medication.instructions,
      };
      await apiFetch(`/medications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      await loadFromApi();
    } catch (e) {
      console.error('Erro ao atualizar medicação', e);
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      await apiFetch(`/medications/${id}`, { method: 'DELETE' });
      await loadFromApi();
    } catch (e) {
      console.error('Erro ao deletar medicação', e);
    }
  };

  const addStockEntry = async (medicationId: string, quantity: number, source: string) => {
    try {
      await apiFetch(`/stock/entry`, {
        method: 'POST',
        body: JSON.stringify({ medicationId, quantity, source }),
      });
      await loadFromApi();
    } catch (e) {
      console.error('Erro ao adicionar entrada de estoque', e);
    }
  };

  const approveReplenishment = async (id: string, quantity: number) => {
    try {
      await apiFetch(`/replenishment/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ requestId: id, quantityAdded: quantity }),
      });
      await loadFromApi();
    } catch (e) {
      console.error('Erro ao aprovar reposição', e);
    }
  };

  const rejectReplenishment = async (id: string) => {
    try {
      await apiFetch(`/replenishment/${id}/reject`, { method: 'POST' });
      await loadFromApi();
    } catch (e) {
      console.error('Erro ao rejeitar reposição', e);
    }
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
