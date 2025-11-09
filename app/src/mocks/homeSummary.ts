import type { HomeSummary } from "@types";

export const homeSummaryMock: HomeSummary = {
  caregiverName: "Maria",
  nextAppointments: [
    {
      id: "apt-1",
      type: "consulta",
      title: "Consulta com Dr. João (Cardiologista)",
      date: "2025-11-12",
      time: "09:30",
      location: "Clínica Boa Saúde",
      patientName: "Paulo",
    },
    {
      id: "apt-2",
      type: "vacina",
      title: "Vacina Influenza",
      date: "2025-11-15",
      time: "15:00",
      location: "Posto Riachinho",
      patientName: "Paulo",
    },
  ],
  medicationsSummary: {
    totalActive: 6,
    pendingConfirmation: 1,
    lowStock: [
      {
        id: "med-2",
        name: "Espirolactona 25mg",
        remainingDoses: 2,
        refillUntil: "2025-11-09",
        refillLocation: "Farmácia Central Bairro Azul",
      },
      {
        id: "med-1",
        name: "ASS 100mg",
        remainingDoses: 8,
        refillUntil: "2025-11-10",
        refillLocation: "Posto de Saúde Jardim das Flores",
      },
    ],
  },
  alerts: [
    {
      id: "alert-1",
      message: "Confirme a administração da medicação de Pedro às 08:00.",
      createdAt: "2025-11-08T08:00:00",
      read: false,
    },
  ],
};
