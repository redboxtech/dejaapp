import { create } from "zustand";

import { authService } from "@services/authService";
import { authConfig } from "@config/security/authConfig";
import { secureStorage } from "@services/secureStorage";

type RepresentativeUser = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  user: RepresentativeUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  initialize: async () => {
    const [token, refreshToken, userData] = await Promise.all([
      secureStorage.getItem(authConfig.tokenStorageKey),
      secureStorage.getItem(authConfig.refreshTokenStorageKey),
      secureStorage.getItem("dejaapp@user")
    ]);

    if (token && refreshToken && userData) {
      set({
        token,
        refreshToken,
        user: JSON.parse(userData),
        isAuthenticated: true
      });
    }
  },
  signIn: async (email: string, password: string) => {
    const result = await authService.signIn({ email, password });

    const user = {
      id: email,
      name: result.caregiverName ?? "Responsável",
      email
    };

    set({
      token: result.accessToken,
      refreshToken: result.refreshToken,
      user,
      isAuthenticated: true
    });

    await Promise.all([
      secureStorage.saveItem(authConfig.tokenStorageKey, result.accessToken),
      secureStorage.saveItem(authConfig.refreshTokenStorageKey, result.refreshToken),
      secureStorage.saveItem("dejaapp@user", JSON.stringify(user))
    ]);
  },
  signOut: async () => {
    const { refreshToken } = get();
    if (refreshToken) {
      await authService.revoke(refreshToken);
    }

    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false
    });

    await Promise.all([
      secureStorage.deleteItem(authConfig.tokenStorageKey),
      secureStorage.deleteItem(authConfig.refreshTokenStorageKey),
      secureStorage.deleteItem("dejaapp@user")
    ]);
  },
  refreshSession: async () => {
    const { refreshToken } = get();
    if (!refreshToken) {
      return false;
    }

    try {
      const result = await authService.refresh(refreshToken);

      set({
        token: result.accessToken,
        refreshToken: result.refreshToken,
        isAuthenticated: true
      });

      await secureStorage.saveItem(authConfig.tokenStorageKey, result.accessToken);
      await secureStorage.saveItem(authConfig.refreshTokenStorageKey, result.refreshToken);

      return true;
    } catch (error) {
      await get().signOut();
      return false;
    }
  }
}));

