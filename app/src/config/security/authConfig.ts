export const authConfig = {
  tokenStorageKey: "dejaapp@auth-token",
  refreshTokenStorageKey: "dejaapp@refresh-token",
  secureStoreOptions: {
    keychainService: "dejaapp.credentials",
    sharedPreferencesName: "dejaapp.credentials"
  }
} as const;

