import { apiClient } from "./apiClient";

type Credentials = {
  email: string;
  password: string;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  caregiverName: string;
};

export const authService = {
  async signIn(credentials: Credentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  async refresh(refreshToken: string): Promise<Omit<AuthResponse, "caregiverName">> {
    const response = await apiClient.post<Omit<AuthResponse, "caregiverName">>(
      "/auth/refresh",
      { refreshToken }
    );
    return response.data;
  },

  async revoke(refreshToken: string): Promise<void> {
    await apiClient.post("/auth/revoke", { refreshToken });
  }
};

