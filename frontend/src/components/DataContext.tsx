import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../lib/api";

// Types
export type DosageUnit = "mg" | "g" | "ml" | "mcg" | "ui"; // Unidade de medida da dosagem (princípio ativo)
export type PresentationForm = "comprimido" | "capsula" | "gotas" | "aplicacao" | "inalacao" | "ampola" | "xarope" | "suspensao"; // Forma de apresentação
export type MedicationUnit = DosageUnit | PresentationForm; // Mantido para compatibilidade temporária
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
  dosageUnit: DosageUnit; // Unidade de medida da dosagem (mg, g, ml, etc.)
  presentationForm: PresentationForm; // Forma de apresentação (comprimido, cápsula, gotas, etc.)
  unit: MedicationUnit; // Mantido para compatibilidade - será removido depois
  patient: string;
  patientId: string;
  route: string;
  frequency: string;
  times: string[];
  isHalfDose: boolean; // Meia dose (1/2 comprimido por administração)
  customFrequency?: string; // Frequência personalizada (ex: "a cada 2 dias")
  isExtra: boolean; // Medicação extra/avulsa
  prescriptionId?: string; // ID da receita associada (opcional)
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
  patient: string; // Mantido para compatibilidade, mas não será exibido
  current: number;
  dailyConsumption: number;
  daysLeft: number;
  estimatedEndDate: string;
  boxQuantity: number;
  presentationForm?: string; // Forma de apresentação (comprimido, gotas, etc.) - usado para estoque
  unit: MedicationUnit; // Mantido para compatibilidade
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
  addMedicationToPatient: (
    medicationId: string,
    patientId: string,
    posology: {
      frequency: string;
      times: string[];
      isHalfDose: boolean;
      customFrequency?: string;
      isExtra: boolean;
      treatmentType: TreatmentType;
      treatmentStartDate: string;
      treatmentEndDate?: string;
      hasTapering: boolean;
      dailyConsumption: number;
      prescriptionId?: string;
    }
  ) => Promise<void>;
  updateMedication: (id: string, medication: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  addStockEntry: (medicationId: string, quantity: number, source: string, price?: number | null, totalInstallments?: number | null) => void;
  approveReplenishment: (id: string, quantity: number) => void;
  rejectReplenishment: (id: string) => void;
  getMedicationsByPatient: (patientId: string) => Medication[];
  getStockByMedication: (medicationId: string) => StockItem | undefined;
  monthlyExpenses: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [replenishmentRequests, setReplenishmentRequests] = useState<ReplenishmentRequest[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(0);

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
      // Buscar configurações de alertas primeiro para usar thresholds dinâmicos
      const alertSettings = await apiFetch<any>(`/alerts/settings`).catch(() => null);
      
      // Usar thresholds das configurações ou valores padrão
      const LOW_STOCK_THRESHOLD = alertSettings?.lowStockThreshold ?? 7;
      const CRITICAL_STOCK_THRESHOLD = alertSettings?.criticalStockThreshold ?? 3;
      
      const [patientsRes, medicationsRes, requestsRes, stockRes, expensesRes] = await Promise.all([
        apiFetch<any[]>(`/patients`),
        apiFetch<any[]>(`/medications`),
        apiFetch<ReplenishmentRequest[]>(`/replenishment`),
        apiFetch<StockItem[]>(`/stock`),
        apiFetch<{ total: number }>(`/stock/monthly-expenses`).catch(() => ({ total: 0 })),
      ]);
      setPatients(patientsRes || []);
      
      // Mapear TreatmentType do backend (enum 0/1) para strings do frontend
      // O status já vem calculado do backend usando os thresholds dinâmicos
      // O backend agora retorna uma lista de Patients em vez de um único patientId/patient
      // Precisamos criar uma entrada de medicação para cada paciente associado
      const mappedMedications: Medication[] = [];
      
      (medicationsRes || []).forEach((med: any) => {
        // Mapear TreatmentType
        const treatmentType = med.treatmentType === 0 || med.treatmentType === "Continuous" ? "continuo" : 
                               med.treatmentType === 1 || med.treatmentType === "Temporary" ? "temporario" : 
                               "continuo"; // default
        
        // O backend já calcula o status usando os thresholds dinâmicos
        // Mas garantimos que o status seja válido
        let status = med.status?.toLowerCase() || "ok";
        if (status !== "critical" && status !== "warning" && status !== "ok") {
          // Fallback: calcular baseado em daysLeft se status inválido
          if (med.daysLeft !== undefined && med.daysLeft !== null) {
            if (med.daysLeft <= CRITICAL_STOCK_THRESHOLD) {
              status = "critical";
            } else if (med.daysLeft <= LOW_STOCK_THRESHOLD) {
              status = "warning";
            } else {
              status = "ok";
            }
          }
        }
        
        // Compatibilidade: Se med.Patients existe (nova estrutura), criar uma entrada por paciente
        // Se med.patientId existe (estrutura antiga), usar ela
        // O backend retorna Patients (com P maiúsculo) ou patients (com p minúsculo)
        const patientsList = med.Patients || med.patients || [];
        
        if (Array.isArray(patientsList) && patientsList.length > 0) {
          // Nova estrutura: criar uma entrada para cada paciente
          patientsList.forEach((patientInfo: any) => {
            const patientId = patientInfo.PatientId || patientInfo.patientId;
            const patientName = patientInfo.PatientName || patientInfo.patientName;
            const dailyConsumption = patientInfo.DailyConsumption || patientInfo.dailyConsumption || med.totalDailyConsumption || med.TotalDailyConsumption || 0;
            
            if (patientId) {
              mappedMedications.push({
                ...med,
                patientId: String(patientId), // Garantir que seja string
                patient: patientName || "",
                dailyConsumption: dailyConsumption,
                treatmentType,
                status,
                isHalfDose: med.isHalfDose ?? false,
                customFrequency: med.customFrequency ?? undefined,
                isExtra: med.isExtra ?? false
              });
            }
          });
        } else if (med.patientId) {
          // Estrutura antiga (compatibilidade)
          mappedMedications.push({
            ...med,
            patientId: String(med.patientId), // Garantir que seja string
            treatmentType,
            status,
            isHalfDose: med.isHalfDose ?? false,
            customFrequency: med.customFrequency ?? undefined,
            isExtra: med.isExtra ?? false
          });
        }
      });
      
      setMedications(mappedMedications);
      
      setReplenishmentRequests(requestsRes || []);
      setStockItems(stockRes || []);
      setMonthlyExpenses(expensesRes?.total || 0);
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
      // Adicionar apenas informações da medicação (sem posologia)
      // A posologia será adicionada posteriormente através de addMedicationToPatient
      const body = {
        name: medication.name,
        dosage: medication.dosage,
        dosageUnit: medication.dosageUnit || medication.unit, // Priorizar dosageUnit, usar unit como fallback
        presentationForm: medication.presentationForm || (medication.unit && ["comprimido", "capsula", "gotas", "aplicacao", "inalacao", "ampola", "xarope", "suspensao"].includes(medication.unit) ? medication.unit : "comprimido"), // Inferir presentationForm do unit antigo se necessário
        route: medication.route,
        initialStock: medication.currentStock, // Estoque inicial será registrado como movimentação
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
      throw e;
    }
  };

  const addMedicationToPatient = async (
    medicationId: string,
    patientId: string,
    posology: {
      frequency: string;
      times: string[];
      isHalfDose: boolean;
      customFrequency?: string;
      isExtra: boolean;
      treatmentType: TreatmentType;
      treatmentStartDate: string;
      treatmentEndDate?: string;
      hasTapering: boolean;
      dailyConsumption: number;
      prescriptionId?: string;
    }
  ) => {
    try {
      const treatmentTypeMap: Record<string, number> = { continuo: 0, temporario: 1 };
      const normalizedTimes = (posology.times || []).map((t) => t.trim()).filter(Boolean);
      const body = {
        medicationId,
        patientId,
        frequency: posology.frequency,
        times: normalizedTimes,
        isHalfDose: posology.isHalfDose ?? false,
        customFrequency: posology.customFrequency || null,
        isExtra: posology.isExtra ?? false,
        treatmentType: treatmentTypeMap[posology.treatmentType] ?? 0,
        treatmentStartDate: posology.treatmentStartDate,
        treatmentEndDate: posology.treatmentEndDate || null,
        hasTapering: posology.hasTapering,
        dailyConsumption: posology.dailyConsumption,
        prescriptionId: posology.prescriptionId || null,
      };
      await apiFetch(`/medications/add-to-patient`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      await loadFromApi();
    } catch (e) {
      console.error('Erro ao adicionar medicação ao paciente', e);
      throw e;
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
      const body: any = {
        id,
        name: medication.name,
        dosage: medication.dosage,
        dosageUnit: medication.dosageUnit || medication.unit, // Priorizar dosageUnit, usar unit como fallback
        presentationForm: medication.presentationForm || (medication.unit && ["comprimido", "capsula", "gotas", "aplicacao", "inalacao", "ampola", "xarope", "suspensao"].includes(medication.unit) ? medication.unit : "comprimido"), // Inferir presentationForm do unit antigo se necessário
        unit: medication.unit, // Mantido para compatibilidade
        route: medication.route,
        frequency: medication.frequency,
        times: normalizedTimes.length > 0 ? normalizedTimes : undefined,
        isHalfDose: medication.isHalfDose !== undefined ? medication.isHalfDose : undefined,
        customFrequency: medication.customFrequency !== undefined ? (medication.customFrequency || null) : undefined,
        isExtra: medication.isExtra !== undefined ? medication.isExtra : undefined,
        treatmentStartDate: startDate,
        treatmentEndDate: medication.treatmentEndDate ?? null,
        hasTapering: medication.hasTapering,
        dailyConsumption: medication.dailyConsumption,
        boxQuantity: medication.boxQuantity,
        instructions: medication.instructions,
        prescriptionId: medication.prescriptionId || null,
      };
      
      // Converter treatmentType de string para número se fornecido
      if (medication.treatmentType) {
        body.treatmentType = treatmentTypeMap[medication.treatmentType] ?? 0;
      }
      
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

  const addStockEntry = async (medicationId: string, quantity: number, source: string, price?: number | null, totalInstallments?: number | null) => {
    try {
      await apiFetch(`/stock/entry`, {
        method: 'POST',
        body: JSON.stringify({ medicationId, quantity, source, price: price || null, totalInstallments: totalInstallments || null }),
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
    addMedicationToPatient,
    updateMedication,
    deleteMedication,
    addStockEntry,
    approveReplenishment,
    rejectReplenishment,
    getMedicationsByPatient,
    getStockByMedication,
    monthlyExpenses,
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
