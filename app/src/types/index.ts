export type MedicationSchedule = {
  id: string;
  medicationId: string;
  patientId: string;
  dosage: string;
  frequency: string;
  nextAdministration: string;
};

export type AgendaItem = {
  id: string;
  type: "consulta" | "exame" | "vacina";
  date: string;
  time?: string;
  location?: string;
  notes?: string;
};

export type Representative = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

export type HomeSummary = {
  caregiverName: string;
  nextAppointments: Array<{
    id: string;
    type: "consulta" | "exame" | "vacina";
    title: string;
    date: string;
    time?: string;
    location?: string;
    patientName: string;
  }>;
  medicationsSummary: {
    totalActive: number;
    pendingConfirmation: number;
    lowStock: Array<{
      id: string;
      name: string;
      remainingDoses: number;
      refillUntil: string;
    }>;
  };
  alerts: Array<{
    id: string;
    message: string;
    createdAt: string;
    read: boolean;
  }>;
};

