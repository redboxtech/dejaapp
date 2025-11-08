export const apiConfig = {
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://sua-api-deja.com",
  timeout: 10000,
  endpoints: {
    auth: "/auth",
    medications: "/medications",
    agenda: "/caregiver-schedules",
    patients: "/patients",
    stock: "/stock",
    notifications: "/notifications"
  }
} as const;

